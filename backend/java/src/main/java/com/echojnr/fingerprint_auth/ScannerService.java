package com.echojnr.fingerprint_auth;
import com.echojnr.utils.OutputHelper;

import SecuGen.FDxSDKPro.jni.JSGFPLib;
import SecuGen.FDxSDKPro.jni.SGDeviceInfoParam;
import SecuGen.FDxSDKPro.jni.SGFDxDeviceName;
import SecuGen.FDxSDKPro.jni.SGFDxErrorCode;
import SecuGen.FDxSDKPro.jni.SGFingerInfo;
import SecuGen.FDxSDKPro.jni.SGFingerPosition;
import SecuGen.FDxSDKPro.jni.SGImpressionType;


public class ScannerService{
	
	static OutputHelper helper = new OutputHelper();
	static long timeout;
	
	public static class ScanResult {
		public byte[] imageBuffer;
		public byte[] templateBuffer;
		public int[] quality;
		
		public ScanResult(byte[] imageBuffer, byte[] templateBuffer, int[] quality) {
			this.imageBuffer = imageBuffer;
			this.templateBuffer = templateBuffer;
			this.quality = quality;
		}
	}
	
	public static ScanResult init_scanner(JSGFPLib sgfplib) {
		long error = sgfplib.Init(SGFDxDeviceName.SG_DEV_AUTO); 	//Initialize the JSGFPLib
		sgfplib.OpenDevice(0); 										//To open the scanner device
		
		SGDeviceInfoParam device_info = new SGDeviceInfoParam(); 	//Get Device Info
		sgfplib.GetDeviceInfo(device_info);
		
		if(error != SGFDxErrorCode.SGFDX_ERROR_NONE) { 			//If no device is found or connected
			helper.colorOutput(OutputHelper.RED, "No scanner detected", error);
			return null;
		}
		
		int m_ImageHeight = device_info.imageHeight, 		//Assign the height and width of the
			m_ImageWidth = device_info.imageWidth;			//scanner to a variable
		
		//Capture the fingerprint image
		byte[] buffer = new byte[m_ImageWidth*m_ImageHeight];	//Create a container to store the fingerprint data
		long timeout = 10000;									//Timeout before the scanner is closed
		long quality = 80;										//Quality of the scan, the minimum scan quality before the scanner accepts the scan
		
		return scan(sgfplib, m_ImageHeight, m_ImageWidth, buffer, timeout, quality);
	}
	
	//Handles fingerprint scan and template logic
	public static ScanResult scan(JSGFPLib sgfplib, int m_ImageHeight, int m_ImageWidth, byte[] buffer, long timeout, long quality) {
		helper.debug("Place your finger on the scanner...");
		
		int[] img_qlty = new int[1];
		long result = sgfplib.GetImageEx(buffer, timeout, 0, quality);					//Get the fingerprint image, perform the scan and store the success result in a variable 0 for success 54 for timeout, then the image in the buffer
			
		if(result != SGFDxErrorCode.SGFDX_ERROR_NONE) {									//if timeout output this
			helper.error("Timeout...");
			return null;
		}
		
		sgfplib.GetImageQuality(m_ImageWidth, m_ImageHeight, buffer, img_qlty);		//Get the scanned image quality
		
		if(img_qlty[0] < 80) {
			helper.warning("Please scan again, poor image quality");
			return scan(sgfplib, m_ImageHeight, m_ImageWidth, buffer, timeout, quality);
		}
		
		helper.success("Captured!");
		return createTemplate(sgfplib, img_qlty, buffer);
	}
	
	public static ScanResult createTemplate(JSGFPLib sgfplib, int[] img_qlty, byte[] buffer) {
		//Create template from captured image
		int[] maxTemplateSize = new int[1];												//Create a container to store the template size
		sgfplib.GetMaxTemplateSize(maxTemplateSize);									//Get the max size of the template
		byte[] template= new byte[maxTemplateSize[0]];									//Creates a container to store the fingerprint template
		
		//Set information about the template
		SGFingerInfo finger_info = new SGFingerInfo();
		finger_info.FingerNumber = SGFingerPosition.SG_FINGPOS_LI;
		finger_info.ImageQuality = img_qlty[0];
		finger_info.ImpressionType = SGImpressionType.SG_IMPTYPE_LP;
		finger_info.ViewNumber = 1;
		
		sgfplib.CreateTemplate(finger_info, buffer, template);
		sgfplib.Close();
		
		return new ScanResult(buffer, template, img_qlty);
	}
}
