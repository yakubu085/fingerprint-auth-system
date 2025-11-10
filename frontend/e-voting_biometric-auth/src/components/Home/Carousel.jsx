import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.jpg';
import img3 from '../../assets/img3.png';
import img4 from '../../assets/voting1.gif';
import img5 from '../../assets/voting2.png';
import img6 from '../../assets/voting3.png'; 
import img7 from '../../assets/voting4.png'; 

const Carousel = () => {
  return (
    
    <div id="carouselExampleAutoplaying" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators custom-indicators">
        <button type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide-to="0" class="active slide-btn" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide-to="1" class="slide-btn" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide-to="2" class="slide-btn" aria-label="Slide 3"></button>
        <button type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide-to="3" class="slide-btn" aria-label="Slide 4"></button>
      </div>
      <div class="carousel-inner">
          <div className="overlay"></div>
          <div class="carousel-item active">
            <img src={img4} class="d-block w-100 carousel-img" alt="..."/>
            <div class="carousel-caption d-none d-md-block">
              <h5>First slide label</h5>
              <p>Some representative placeholder content for the third slide.</p>
            </div>
          </div>
          <div class="carousel-item">
            <img src={img5} class="d-block w-100 carousel-img" alt="..."/>
            <div class="carousel-caption d-none d-md-block">
              <h5>Third slide label</h5>
              <p>Some representative placeholder content for the third slide.</p>
            </div>
          </div>
          <div class="carousel-item">
            <img src={img6} class="d-block w-100 corousel-img" alt="..."/>
            <div class="carousel-caption d-none d-md-block">
              <h5>Third slide label</h5>
              <p>Some representative placeholder content for the third slide.</p>
            </div>
          </div>
          <div class="carousel-item">
            <img src={img7} class="d-block w-100 corousel-img" alt="..."/>
            <div class="carousel-caption d-none d-md-block">
              <h5>Third slide label</h5>
              <p>Some representative placeholder content for the third slide.</p>
            </div>
          </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
      </button>
    </div>
  )
}

export default Carousel
