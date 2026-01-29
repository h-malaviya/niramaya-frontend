'use client'

import { validateSession } from "@/app/lib/authApi";
import { clearAuthCookies } from "@/app/lib/authCookies";
import { useEffect } from "react";

export default  function NavBar(){
    useEffect(()=>{
        try {
            validateSession()
        } catch (error) {
            clearAuthCookies()
        }
        
    },[])
    return(
        <>
            <h1>NavBar Client</h1>
        </>
    );
}