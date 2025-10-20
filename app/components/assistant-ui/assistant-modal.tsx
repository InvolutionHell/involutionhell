"use client";

import { BotIcon, ChevronDownIcon } from "lucide-react";

import { type FC, forwardRef, useState, useEffect } from "react";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { usePathname } from "next/navigation";

import { Thread } from "@/app/components/assistant-ui/thread";
import { TooltipIconButton } from "@/app/components/assistant-ui/tooltip-icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

interface AssistantModalProps {
  errorMessage?: string;
  showSettingsAction?: boolean;
  onClearError?: () => void;
}

export const AssistantModal: FC<AssistantModalProps> = ({
  errorMessage,
  showSettingsAction = false,
  onClearError,
}) => {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    // 检查本次访问是否已关闭过气泡
    const bubbleClosed = sessionStorage.getItem("ai-bubble-closed");

    if (!bubbleClosed) {
      // 页面加载后2秒显示气泡提示
      const showTimer = setTimeout(() => {
        setShowBubble(true);
      }, 2000);

      // 15秒后自动关闭气泡
      const hideTimer = setTimeout(() => {
        setShowBubble(false);
        sessionStorage.setItem("ai-bubble-closed", "true");
      }, 17000); // 2秒显示 + 15秒停留 = 17秒

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleCloseBubble = () => {
    setShowBubble(false);
    // 记录本次访问已关闭气泡
    sessionStorage.setItem("ai-bubble-closed", "true");
  };

  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 size-14">
        {/* 自定义气泡组件 */}
        {showBubble && (
          <div
            className="absolute bottom-17 right-0 z-40 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
            onClick={handleCloseBubble}
          >
            <div className="relative bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-black dark:border-white px-8 py-5 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="text-base text-gray-800 dark:text-gray-100 font-medium whitespace-nowrap">
                有问题可以问我哦～
              </div>
              {/* 气泡尾巴箭头 - 指向下方按钮 */}
              <div className="absolute -bottom-2 right-8">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-100/70 dark:border-t-gray-800/70"></div>
                <div className="absolute -top-[2px] -left-[2px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-black dark:border-t-white"></div>
              </div>
            </div>
          </div>
        )}

        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton onCloseBubble={handleCloseBubble} />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="aui-root aui-modal-content z-50 h-[500px] w-[400px] overflow-clip rounded-xl border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in [&>.aui-thread-root]:bg-inherit"
      >
        <Thread
          errorMessage={errorMessage}
          showSettingsAction={showSettingsAction}
          onClearError={onClearError}
        />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};

type AssistantModalButtonProps = {
  "data-state"?: "open" | "closed";
  onCloseBubble?: () => void;
  onClick?: (e: React.MouseEvent) => void;
};

const AssistantModalButton = forwardRef<
  HTMLButtonElement,
  AssistantModalButtonProps
>(({ "data-state": state, onCloseBubble, ...rest }, ref) => {
  const tooltip = state === "open" ? "Close Assistant" : "Open Assistant";

  const handleClick = (e: React.MouseEvent) => {
    // 当点击open按钮时，关闭气泡对话
    if (onCloseBubble) {
      onCloseBubble();
    }
    // 继续执行原有的点击事件
    if (rest.onClick) {
      rest.onClick(e);
    }
  };

  return (
    <TooltipIconButton
      variant="default"
      tooltip={tooltip}
      side="left"
      {...rest}
      onClick={handleClick}
      className="aui-modal-button size-full rounded-full shadow transition-transform hover:scale-110 active:scale-90 cursor-pointer"
      ref={ref}
    >
      <BotIcon
        data-state={state}
        className="aui-modal-button-closed-icon absolute !size-7 transition-all data-[state=closed]:scale-100 data-[state=closed]:rotate-0 data-[state=open]:scale-0 data-[state=open]:rotate-90"
      />

      <ChevronDownIcon
        data-state={state}
        className="aui-modal-button-open-icon absolute !size-7 transition-all data-[state=closed]:scale-0 data-[state=closed]:-rotate-90 data-[state=open]:scale-100 data-[state=open]:rotate-0"
      />
      <span className="aui-sr-only sr-only">{tooltip}</span>
    </TooltipIconButton>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";
