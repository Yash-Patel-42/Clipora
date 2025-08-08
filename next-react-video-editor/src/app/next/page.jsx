"use client"
import { useState } from 'react';
import Sidebar from './components/Sidebar';

export default function () {
    const [pro,setPro] = useState(false);
    const handle = async(t)=>{console.log(t);}

    return (
        <Sidebar onToolClick={handle} processing={pro}/>
    )
}