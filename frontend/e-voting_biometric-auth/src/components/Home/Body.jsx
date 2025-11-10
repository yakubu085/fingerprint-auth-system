import { Link } from "react-router-dom"

const Body = () => {
  return (
    <div className="body d-flex justify-content-center my-4">
        <div className="body-content d-flex flex-column justify-content-center my-4 width-2">
            <span className="">Lorem ipsum dolor sit amet consectetur, adipisicing elit. At autem omnis neque repudiandae facere nulla incidunt molestiae esse suscipit quo.</span>
            <Link className="btn btn-primary py-2 px-4 w-4" to='/signup'>Get Started</Link>
        </div>
    </div>
  )
}

export default Body
