import React from 'react'
import Button from '../atoms/Button';

const Notifications = () => {
  return (
    <div className='col-flex gap-8 px-5 py-8 bg-background rounded-lg border-2 border-foreground fixed top-30 inset-x-4
    
    md:inset-x-10 md:top-20
    xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto
    '>
        <h2>Notifications</h2>
        <div className='col-flex gap-3 h-30 overflow-y-scroll mb-'>
    {
        Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className='col-flex gap-1'>
    <div className='col-flex gap-1'>
<span>Qorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
<span className='text-xs'>Sent at mm/dd/yyyy</span>
    </div>
        </div>
    ))}
    
    </div>
    <Button className='border border-foreground text-foreground w-1/2 p-3! row-flex gap-2 flex-centerize'>
    <span>Load more</span>
</Button>
    
    </div>
  );
};

export default Notifications;