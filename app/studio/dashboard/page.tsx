'use client'

import React, { useState } from 'react'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootFixed from '@/app/components/sections/AddShootFixed'
import Toast from '@/app/components/sections/Toast'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard')

  const tabs = ['Dashboard', 'Expiring', 'Expired']

  return (
    <main className='col-flex'>

<div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14'>
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


<div className='col-flex gap-12 '>
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