import React from 'react';
import assets from '../assets/assets.js'; 
const ChatContainer = ({ selectedUser, setSelectedUser }) => {
    return selectedUser ? (
        <div className='h-full overflow-scroll relative backdrop-blur-lg'>
            <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
                <img src={assets.profile_martin} alt="User profile" className="w-8 rounded-full" />
                <p className='flex-1 text-lg text-white flex items-center gap-2'>
                    {selectedUser.name}
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="Back" className='md:hidden max-w-7 cursor-pointer' />
                <img src={assets.help_icon} alt="Help" className='max-md:hidden max-w-5' />
            </div>
        </div>
    ) : (
        <div className='h-full flex items-center justify-center'>
            <img src={assets.logo_big} alt="Chat Icon" className='max-w-40' />
            <p className='text-white text-lg'>Select a chat to start messaging</p>
        </div>
    );
};

export default ChatContainer;
