import AddScheduleModal from './AddScheduleModal'
import { useState } from 'react'

export default function FloatingActionButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black 
                    w-14 h-14 rounded-full text-2xl font-bold shadow-lg flex items-center justify-center"
        onClick={() => setShowModal(true)}
       >
        +
       </button>
      <AddScheduleModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
