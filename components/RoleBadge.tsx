import { getCurrentRole } from '../lib/role'

export default async function RoleBadge() {
  const role = await getCurrentRole()
  return (
    <div className="badge" style={{borderColor:'#C8A24A', color:'#C8A24A'}}>
      {role === 'wholesale' ? 'Wholesale' : 'Retail'}
    </div>
  )
}
