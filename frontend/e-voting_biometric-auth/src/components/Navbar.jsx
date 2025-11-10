import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav class="navbar navbar-expand-lg bg-body-tertiary bg-dark" data-bs-theme="dark">
        <div class="container-fluid">
            <a class="navbar-brand mx-5" href="#">E-Voting System</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <div className='d-flex'>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <Link class="nav-link active" aria-current="page" to="/">Home</Link>
                        </li>
                        <li class="nav-item">
                            <Link class="nav-link" to="/scan">Scan</Link>
                        </li>
                        <li class="nav-item">
                            <Link class="nav-link" to="/match">Match</Link>
                        </li>
                        <li class="nav-item">
                            <Link class="nav-link disabled">Disabled</Link>
                        </li>
                    </ul>
                   
                </div>
                <div className='d-flex mx-auto'>
                    <ul className='navbar-nav'>
                        <li className="nav-item">
                            <Link className="btn btn-primary mx-2" to='/login'>Login</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="btn btn-secondary" to='/signup'>Sign up</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar
