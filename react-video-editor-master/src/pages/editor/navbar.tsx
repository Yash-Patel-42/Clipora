import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { HISTORY_UNDO, HISTORY_REDO, dispatch } from "@designcombo/events"
// import logoDark from "@/assets/logo-dark.png"
import { Icons } from "@/components/shared/icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { download } from "@/utils/download"
import useAuthStore from "@/store/use-auth-store"
import { useNavigate } from "react-router-dom"

import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useStore from "@/store/store"
import { IDesign } from "@designcombo/types"
import { generateId } from "@designcombo/timeline"
const baseUrl = "https://renderer.designcombo.dev"
const size = {
  width: 1080,
  height: 1920,
}
//  https://renderer.designcombo.dev/status/{id}
export default function Navbar() {
  const handleUndo = () => {
    dispatch(HISTORY_UNDO)
  }

  const handleRedo = () => {
    dispatch(HISTORY_REDO)
  }

  const openLink = (url: string) => {
    window.open(url, "_blank") // '_blank' will open the link in a new tab
  }

  return (
    <div className="h-[72px] absolute top-0 left-0 right-0 px-2 z-[205] flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-4 bg-background rounded-md h-12 px-2.5 pointer-events-auto flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUndo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={20} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={20} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-medium text-sm px-1">Untitled video</div>
          <ResizeVideo />
        </div>
        <div className="flex items-center gap-2">
          <DownloadPopover />
        </div>
      </div>
    </div>
  )
}

const UserMenu = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  if (!user) {
    return (
      <Button
        onClick={() => navigate("/auth")}
        className="flex gap-1 h-8"
        variant="default"
      >
        Sign in
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user.avatar} alt="@user" />
          <AvatarFallback>{user.email.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 mr-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Message</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>More...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Team</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Github className="mr-2 h-4 w-4" />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud className="mr-2 h-4 w-4" />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface IDownloadState {
  renderId: string
  progress: number
  isDownloading: boolean
}
const DownloadPopover = () => {
  const [open, setOpen] = useState(false)
  const [downloadState, setDownloadState] = useState<IDownloadState>({
    progress: 0,
    isDownloading: false,
    renderId: "",
  })
  const {
    tracks,
    trackItemIds,
    trackItemsMap,
    trackItemDetailsMap,
    transitionsMap,
    fps,
  } = useStore()

  const handleExport = () => {
    const data: IDesign = {
      id: generateId(),
      fps,
      tracks,
      size,
      trackItemDetailsMap,
      trackItemIds,
      transitionsMap,
      trackItemsMap,
      transitionIds: [],
    }
    console.log(JSON.stringify(data))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (downloadState.renderId) {
      interval = setInterval(() => {
        fetch(`${baseUrl}/status/${downloadState.renderId}`)
          .then((res) => res.json())
          .then(({ render: { progress, output } }) => {
            if (progress === 100) {
              clearInterval(interval)
              setDownloadState({
                ...downloadState,
                renderId: "",
                progress: 0,
                isDownloading: false,
              })
              download(output, `${downloadState.renderId}`)
              setOpen(false)
            } else {
              setDownloadState({
                ...downloadState,
                progress,
                isDownloading: true,
              })
            }
          })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [downloadState.renderId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex gap-1 h-9 w-9 border border-border"
          size="icon"
          variant="secondary"
        >
          <Download width={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 z-[250] flex flex-col gap-4">
        {downloadState.isDownloading ? (
          <>
            <Label>Downloading</Label>
            <div className="flex items-center gap-2">
              <Progress
                className="h-2 rounded-sm"
                value={downloadState.progress}
              />
              <div className="text-zinc-400 text-sm border border-border p-1 rounded-sm">
                {parseInt(downloadState.progress.toString())}%
              </div>
            </div>
            <div>
              <Button className="w-full">Copy link</Button>
            </div>
          </>
        ) : (
          <>
            <Label>Export settings</Label>
            <Button className="w-full justify-between" variant="outline">
              <div>MP4</div>
              <ChevronDown width={16} />
            </Button>
            <div>
              <Button onClick={handleExport} className="w-full">
                Export
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface ResizeOptionProps {
  label: string
  icon: string
  value: ResizeValue
}

interface ResizeValue {
  width: number
  height: number
  name: string
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
]

const ResizeVideo = () => {
  const handleResize = () => {}
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border border-border" variant="secondary">
          Resize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 z-[250]">
        <div className="grid gap-4 text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const ResizeOption = ({
  label,
  icon,
  value,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"]
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex items-center gap-4 hover:bg-zinc-50/10 cursor-pointer"
    >
      <div className="text-muted-foreground">
        <Icon />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-muted-foreground">Tiktok, Instagram</div>
      </div>
    </div>
  )
}
