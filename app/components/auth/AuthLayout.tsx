'use client'
import React from 'react'
import Image from 'next/image'
interface AuthLayoutProps {
    title: string
    subtitle: string
    children: React.ReactNode
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="flex justify-center min-h-screen">
                {/* Left Image */}
                <div
                    className="hidden lg:block lg:w-3/7 bg-cover bg-center bg-no-repeat sticky top-0 h-screen"
              
                >
                    <Image
                        src="/bg3.jpg"
                       
                        alt="Login page image"
                        fill                            
                        quality={100}                   
                        priority                        
                        style={{
                            objectFit: 'cover',         
                            objectPosition: 'left',   
                        }}

                    />
                </div>

                {/* Right Content */}
                <div className="flex items-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-4/7">
                    <div className="w-full">
                        <h1 className="text-2xl font-semibold tracking-wider text-gray-800 capitalize dark:text-white">
                            {title}
                        </h1>

                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                            
                        </p>

                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}