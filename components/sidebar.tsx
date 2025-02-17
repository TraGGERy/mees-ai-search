import HistoryContainer from './history-container'

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-screen p-2 fixed top-0 right-0 flex-col justify-center pb-24 hidden lg:flex">
        <HistoryContainer location="sidebar" />
      </div>
    </div>
  )
}
