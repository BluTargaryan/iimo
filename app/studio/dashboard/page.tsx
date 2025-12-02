'use client'

import React, { useState } from 'react'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootFixed from '@/app/components/sections/AddShootFixed'


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Active')

  const tabs = ['Active', 'Expiring', 'Expired']

  return (
    <main className='col-flex'>

<div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14
md:flex-row! md:items-center! md:gap-12
'>
  {tabs.map((tab) => (
    <span
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`text-xl ${activeTab === tab ? 'h1-like' : ''}`}
    >
      {tab}
    </span>
  ))}
</div>


<div className='grid grid-cols-1 gap-12 md:grid-cols-2  lg:grid-cols-3 '>
  <ShootItem />
  <ShootItem />
  <ShootItem />

</div>
<AddShootFixed/>
{/* <Toast/> */}
    </main>
  )
}

export default Dashboard