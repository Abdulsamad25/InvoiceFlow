import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const PermissionGate = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user) return fallback;
  
  if (hasPermission(user.role, permission)) {
    return children;
  }
  
  return fallback;
};

export default PermissionGate;