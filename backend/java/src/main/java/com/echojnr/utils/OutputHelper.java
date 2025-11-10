package com.echojnr.utils;

public class OutputHelper {
	public static final String RESET = "\u001B[0m";
	public static final String RED = "\u001B[31m";
	public static final String GREEN = "\u001B[32m";
	public static final String YELLOW = "\u001B[33m";
	public static final String BLUE = "\u001B[34m";
	public static final String CYAN = "\u001B[36m";
	
	public void output(Object value) {
		System.out.println(value);
	}
	
	public void output(String message, Object value) {
		System.out.println(message + ": " + value);
	}
	
	public void colorOutput(String color, String message) {
		System.out.println(color + message + RESET);
	}
	
	public void colorOutput(String color, String message, Object value) {
		System.out.println(color + message + ": " + value + RESET);
	}
	
	public void success(String message) {
		colorOutput(GREEN, message);
	}
	
	public void warning(String message) {
		colorOutput(YELLOW, message);
	}
	
	public void error(String message) {
		colorOutput(RED, message);
	}
	
	public void info(String message) {
		colorOutput(BLUE, message);
	}
	
	public void debug(String message) {
		colorOutput(CYAN, message);
	}
}