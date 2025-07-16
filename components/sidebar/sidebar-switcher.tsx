import { ContentType } from "@/types"
import { ChatbotUIContext } from "@/context/context"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { AgentSettingsDialog } from "../agents/agent-settings-dialog"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { isDemoMode } = useContext(ChatbotUIContext)
  const [showAgentSettings, setShowAgentSettings] = useState(false)

  const handleAgentClick = () => {
    setShowAgentSettings(true)
  }

  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <TabsList className="bg-background grid h-[440px] grid-rows-7">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        {!isDemoMode && (
          <>
            <SidebarSwitchItem
              icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
              contentType="presets"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
              contentType="prompts"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
              contentType="models"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
              contentType="files"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
              contentType="collections"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
              contentType="assistants"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
              contentType="tools"
              onContentTypeChange={onContentTypeChange}
            />
          </>
        )}
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        <WithTooltip
          display="AI Agent"
          trigger={
            <button
              onClick={handleAgentClick}
              className="hover:bg-accent flex size-[44px] items-center justify-center rounded"
            >
              <IconRobotFace size={24} />
            </button>
          }
        />
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
      {/* Agent Setup Dialog */}
      <AgentSettingsDialog
        isOpen={showAgentSettings}
        onOpenChange={setShowAgentSettings}
      />
    </div>
  )
}
