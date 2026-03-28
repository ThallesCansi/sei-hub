import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileLinkProps {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function UserProfileLink({
  userId,
  fullName,
  avatarUrl,
  subtitle,
  size = 'sm',
  className = '',
  onClick,
}: UserProfileLinkProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const initials = fullName
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <Link
      to={`/perfil/${userId}`}
      className={`inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity group ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt={fullName} />
        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className={`${textClasses[size]} group-hover:underline`}>
        {fullName}
        {subtitle && (
          <span className="text-muted-foreground ml-1">· {subtitle}</span>
        )}
      </span>
    </Link>
  );
}
