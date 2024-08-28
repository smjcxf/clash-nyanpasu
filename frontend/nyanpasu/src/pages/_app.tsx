import { useMount } from "ahooks";
import dayjs from "dayjs";
import AppContainer from "@/components/app/app-container";
import LocalesProvider from "@/components/app/locales-provider";
import MutationProvider from "@/components/layout/mutation-provider";
import NoticeProvider from "@/components/layout/notice-provider";
import PageTransition from "@/components/layout/page-transition";
import SchemeProvider from "@/components/layout/scheme-provider";
import {
  ThemeModeProvider,
  useCustomTheme,
} from "@/components/layout/use-custom-theme";
import LogProvider from "@/components/logs/log-provider";
import UpdaterDialog from "@/components/updater/updater-dialog-wrapper";
import useUpdater from "@/hooks/use-updater";
import { atomIsDrawer } from "@/store";
import { classNames } from "@/utils";
import { useTheme } from "@mui/material";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { cn, useBreakpoint } from "@nyanpasu/ui";
import { emit } from "@tauri-apps/api/event";
import "dayjs/locale/ru";
import "dayjs/locale/zh-cn";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { SWRConfig } from "swr";
import styles from "./_app.module.scss";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export default function App() {
  const { theme } = useCustomTheme();

  const breakpoint = useBreakpoint();

  const [isDrawer, setIsDrawer] = useAtom(atomIsDrawer);

  useUpdater();

  useEffect(() => {
    setIsDrawer(breakpoint === "sm" || breakpoint === "xs");
  }, [breakpoint, setIsDrawer]);

  useMount(() => {
    import("@tauri-apps/api/window")
      .then(({ appWindow }) => {
        appWindow.show();
        appWindow.unminimize();
        appWindow.setFocus();
      })
      .finally(() => emit("react_app_mounted"));
  });

  return (
    <SWRConfig
      value={{
        errorRetryCount: 5,
        revalidateOnMount: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
      }}
    >
      <CssVarsProvider theme={theme}>
        <ThemeModeProvider />
        <LogProvider />
        <LocalesProvider />
        <MutationProvider />
        <NoticeProvider />
        <SchemeProvider />
        <UpdaterDialog />

        <AppContainer isDrawer={isDrawer}>
          <PageTransition
            className={cn("absolute inset-4 top-10", !isDrawer && "left-0")}
          />
        </AppContainer>
      </CssVarsProvider>
    </SWRConfig>
  );
}

export const Catch = ({ error }: FallbackProps) => {
  const theme = useTheme();

  return (
    <div
      className={classNames(
        styles.oops,
        theme.palette.mode === "dark" && styles.dark,
      )}
    >
      <h1>Oops!</h1>
      <p>Something went wrong... Caught at _app error boundary.</p>
      <pre>{error}</pre>
    </div>
  );
};

export const Pending = () => <div>Loading from _app...</div>;
