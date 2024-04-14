import React from 'react'
import Notes from './Notes';
import './Home.css';
const Home = () => {
    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

  return (
    <div >
      <button onClick={logout} className='logout'>Logout</button>
      <Notes />
    </div>
  )
}

export default Home