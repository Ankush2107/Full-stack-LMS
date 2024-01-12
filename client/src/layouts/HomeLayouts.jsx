import { AiFillCloseCircle} from 'react-icons/ai';
import { FiMenu } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer'

function HomeLayouts({ childern }) {

   // Function to change the width of the drawer-side element to 'auto'
   function changeWidth() {
        // Get the elements with the class name 'drawer-side'
        const drawerSide = document.getElementsByClassName('drawer-side');
        
        // Set the width of the drawer-side element to 'auto'
        drawerSide[0].style.width = 'auto';
    }

    // Function to hide the drawer by unchecking the drawer-toggle input and setting the width of drawer-side to '0'
    function hideDrawer() {
        // Get the elements with the class name 'drawer-toggle'
        const element = document.getElementsByClassName("drawer-toggle");
        
        // Uncheck the drawer-toggle input to hide the drawer
        element[0].checked = false;

        // Get the elements with the class name 'drawer-side'
        const drawerSide = document.getElementsByClassName('drawer-side');
        
        // Set the width of the drawer-side element to '0' to hide it
        drawerSide[0].style.width = '0';
    }

    return (
        <div className="min-h-[90vh]">
            <div className="drawer absolute left-0 z-50 w-full">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Page content here */}
                    <label htmlFor="my-drawer" >
                        <FiMenu onClick={changeWidth} size={"32px"} className='font-bold text-white m-4' />
                    </label>
                </div> 
                <div className="drawer-side w-0">
                    <label htmlFor="my-drawer" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                        {/* Sidebar content here */}
                        <li>
                            <button onClick={hideDrawer}>
                                <AiFillCloseCircle size={24}/>
                            </button>
                        </li>
                        <li>
                            <Link to='/'>Home</Link>
                        </li>
                        <li>
                            <Link to='/about'>About us</Link>
                        </li>
                        <li>
                            <Link to='/contact'>Contact us</Link>
                        </li>
                        <li>
                            <Link to='/courses'>All courses</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {childern}

            <Footer />
            
        </div>
    )
}

export default HomeLayouts;