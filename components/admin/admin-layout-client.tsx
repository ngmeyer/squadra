'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import {
  Home,
  Store,
  Megaphone,
  Package,
  Settings,
  Menu,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { signOut } from '@/lib/supabase/auth'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Stores', href: '/admin/stores', icon: Store },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: User
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const userInitials = user.email
    ?.split('@')[0]
    .substring(0, 2)
    .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Squadra
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Separator className="mb-4" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md w-full transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-left">
                        <span className="sr-only">Your profile</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-m-2.5">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-950 px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Squadra
                </h1>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                isActive
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                              )}
                            >
                              <item.icon
                                className={cn(
                                  isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-x-4 px-2 py-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Squadra
            </h1>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
