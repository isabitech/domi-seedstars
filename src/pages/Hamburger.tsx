import { useState } from "react";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { 
Button,   
} from 'antd';
interface HamburgerProps {
  onLogin: () => void;
}

const Hamburger = ({ onLogin }: HamburgerProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className=" max-tablet:block hidden w-full ">
        
      <div className=" flex gap-90 max-mobile:gap-33 items-center px-8 py-2 max-mobile:px-3 ">
         <div className="text-[#1890ff] text-lg font-bold max-mobile:text-sm">
      Dominion Seedstars
    </div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xl text-[#1890ff] bg-[#1a1a1a]"
        aria-label="Toggle menu"
      >
        {open ? <CloseOutlined /> : <MenuOutlined />}
      </button>
        </div>
     
      {open && (
        <div className=" w-full bg-white shadow-lg  rounded-md z-50 ">
          <ul className="flex flex-col px-4">
            {["Home", "Product", "Blog", "Features", "Docs"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    onLogin();
                  }}
                  className="block hover:bg-gray-100 hover:text-[#1890ff]
                   border-gray-900 border-b"
                >
                  {item}
                </a>
              </li>
            ))}

            <li className="pt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogin();
                }}
                className="w-full bg-[#1890ff] text-white rounded-md"
              >
                SignUp
              </button>
            </li>
             <li className="py-2">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogin();
                }}
                className="w-full bg-[#1890ff] text-white rounded-md"
              >
                Login
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Hamburger;
