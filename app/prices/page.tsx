'use client'

export default function Price(){

    return(
        <div className="relative bottom-1 top-16 items-center justify-items-center font-serif fontsize-ensurer">
           
            <center>
                <h1 className="">Coming Soon Prices</h1>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8">
    
      
    <div className="rounded-2xl border border-green-600 p-6 shadow-sm sm:px-8 lg:p-12">
      
      <div className="text-center">
        <h2 className="text-lg font-medium text-white-900">
          Free Plan
          <span className="sr-only">Plan</span>
        </h2>
        
        <p className="mt-2 sm:mt-4">
          <strong className="text-3xl font-bold text-white-900 sm:text-4xl"> $0</strong>

          <span className="text-sm font-medium text-white-700">/month</span>
        </p>
      </div>
      <a
        href="/"
        className="mt-8 block rounded-full border border-white-600 bg-green px-12 py-3 text-center text-sm font-medium text-white-600 hover:ring-1 hover:ring-green-600 focus:outline-none focus:ring active:text-white-500"
      >
        Current Plan
      </a>
      <ul className="mt-6 space-y-2">
        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700"> Two Ai Model</span>
        </li>

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700"> 30 follow Up Questions </span>
        </li>

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700"> History </span>
        </li>

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700"> Help center access </span>
        </li>
      </ul>

      
    </div>
    <div
      className="rounded-2xl border border-green-600 p-6 shadow-sm ring-1 ring-green-600 sm:order-last sm:px-8 lg:p-12"
    >
      <div className="text-center">
        <h2 className="text-lg font-medium text-White-900">
          Pro
          <span className="sr-only">Plan</span>
        </h2>

        <p className="mt-2 sm:mt-4">
          <strong className="text-3xl font-bold text-white-900 sm:text-4xl">$13</strong>

          <span className="text-sm font-medium text-white-700">/month</span>
        </p>
      </div>
      <a
        href="/"
        className="mt-8 block rounded-full border border-green-600 bg-black-600 px-12 py-3 text-center text-sm font-medium text-white hover:bg-black-700 hover:ring-1 hover:ring-black-700 focus:outline-none focus:ring active:text-indigo-500"
      >
        Return Home
      </a>

      <ul className="mt-6 space-y-2">
        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700">All AI Models</span>
        </li>

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700">Unlimited FollowUp</span>
        </li>

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700">History </span>
        </li>

       

        <li className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5 text-green-700"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>

          <span className="text-white-700">High Quality Results</span>
        </li>
      </ul>

    </div>
  </div>
</div>
            </center>

            
        </div>
    )
}