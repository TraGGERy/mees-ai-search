import { SignIn, SignUp } from "@clerk/nextjs";
import React from 'react'

export default function signUpPage() {
  return (
    <div className="flex items-center justify-center h-screen">
         <SignUp />
    </div>
 
);
}