import {
  FileText,
  HelpCircle,
  LifeBuoy,
  Shield,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-2 right-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground/50"
          >
            <HelpCircle size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href="/communities" className="flex items-center gap-2">
              <Users size={16} />
              Communities
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/privacy" className="flex items-center gap-2">
              <Shield size={16} />
              Privacy Policy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/terms" className="flex items-center gap-2">
              <FileText size={16} />
              Terms of Service
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/help" className="flex items-center gap-2">
              <LifeBuoy size={16} />
              Help
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </footer>
  )
}

export default Footer
