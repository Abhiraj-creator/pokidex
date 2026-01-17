import { use } from "react"
import { useParams } from "react-router-dom"

const User = () => {
    const {id}=useParams()
  return (
    <div>User</div>
  )
}

export default User