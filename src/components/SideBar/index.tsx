import React, { ReactNode, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'app/rootReducer';
import { favoriteSelector } from 'features/linkSlices';
import { Theme } from 'features/settingSlices';
import { NavTabType, toggleLinkTab, toggleRecents } from 'features/navSlices';
import { makeStyles } from 'styles/common';
import EventNote from '@mui/icons-material/EventNote';
import Star from '@mui/icons-material/Star';
import ListAlt from '@mui/icons-material/ListAlt';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Tab,
  Tooltip,
  Typography,
} from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { MimeType } from 'constants/editor';
import { PageButton } from 'components/NavBar/PageButton';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Delete from '@mui/icons-material/Delete';
import NavigateNext from '@mui/icons-material/NavigateNext';
import { removeCurrentPage } from 'features/currentSlices';
import Mouse from '@mui/icons-material/Mouse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import BasicCalendar from 'components/calendar/BasicCalendar';
import dayjs from 'dayjs';
import { HeadingView } from './HeadingView';
import { HeadingItem } from './HeadingItem';

import { SidebarItem } from './SidebarItem';
import { GroupView } from './GroupView';
import { LinkTreeView } from './LinkTreeView';
import { WorkspaceButton } from './WorkspaceButton';

interface SideBarProps {
  open: boolean;
  sidebarWidth: number;
}

const useStyles = makeStyles<SideBarProps>()((theme, props) => ({
  title: {
    flexGrow: 1,
    padding: '15px 16px',
    backgroundColor: '#f5f5f5',
  },
  tabListDark: {
    backgroundColor: '#33333',
  },
  tabListLight: {
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e8e8e8',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    flexShrink: 0,
    transform: `translateX(${props.open ? 0 : -props.sidebarWidth}px) translateZ(0)`,
    [`& .MuiDrawer-paper`]: {
      width: props.sidebarWidth,
      boxSizing: 'border-box',
      position: 'absolute',
      transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    },

    [`& .MuiListItem-root`]: {
      paddingTop: 2,
      paddingBottom: 2,
    },

    [`& .MuiTabPanel-root`]: {
      padding: 0,
    },

    [`& .MuiTab-root`]: {
      minWidth: 0,
      padding: '0 16px',
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  listItemText: {
    [`& .MuiTypography-root`]: {
      fontSize: '0.875rem',
      paddingLeft: 8,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  listSubHeader: {
    lineHeight: 1.5,
    [`&:hover .group-item-button`]: {
      visibility: 'visible !important' as any,
    },
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      fontSize: '1.5rem',
    },
  },
  timeline: {
    flex: '1 1 auto',
    // width: 320,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    borderRight: theme.palette.mode === Theme.Dark ? '1px solid #555555' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  calendarArea: {
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderBottom: theme.palette.mode === Theme.Dark ? '1px solid #555555' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  timelineList: {
    flex: '1 1 auto',
    overflow: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',

    '& > * ': {
      flex: '1 1 auto',
    },
  },
}));

interface TabLabelProps {
  children: ReactNode;
}
function TabLabel({ children }: TabLabelProps) {
  return <span style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>{children}</span>;
}

type TabPanelHeaderProps = {
  children: ReactNode;
  tools?: ReactNode;
  onClick?: () => void;
};

function TabPanelHeader({ children, tools = '', onClick }: TabPanelHeaderProps) {
  return (
    <ListSubheader>
      <Box display="flex" alignItems="center" justifyContent="space-between" onClick={onClick}>
        <Typography
          variant="h6"
          style={{
            fontWeight: 400,
            fontSize: 14,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 auto',
            cursor: 'pointer',
          }}
        >
          {children}
        </Typography>
        {tools}
      </Box>
    </ListSubheader>
  );
}

TabPanelHeader.defaultProps = {
  tools: '',
};

export function SideBar() {
  const dispatch = useDispatch();
  const navState = useSelector((state: AppState) => state.navState);
  const doc = useSelector((state: AppState) => state.docState.doc);
  const menu = useSelector((state: AppState) => state.settingState.menu);
  const currentWorkspace = useSelector((state: AppState) => state.linkState.workspace);
  const selectedDate = useSelector((state: AppState) => state.calendarState.selectedDate);
  const favorites = useSelector(favoriteSelector);
  const recents = useSelector((state: AppState) => state.currentState.recents);
  const { openTab: open, openRecents, sidebarWidth } = navState;
  const { classes } = useStyles({
    open: useLocation().pathname === '/calendar' ? true : open,
    sidebarWidth,
  });
  const root = doc?.getRoot();
  const mimeType = root?.mimeType || MimeType.MARKDOWN;
  const navigate = useNavigate();
  const [openCalendar, setOpenCalendar] = useState(false);

  const handleOpenRecents = () => {
    dispatch(toggleRecents());
  };

  const handleChange = (event: React.SyntheticEvent<Element, Event>, newValue: NavTabType) => {
    dispatch(toggleLinkTab(newValue));
  };

  const handleDeleteRecentItem = (index: number) => {
    dispatch(removeCurrentPage({ index }));
  };

  return (
    <Drawer variant="permanent" className={classes.drawer} open={open}>
      <TabContext value={navState.openTabValue}>
        <Box>
          <TabList
            onChange={handleChange}
            className={menu.theme === Theme.Dark ? classes.tabListDark : classes.tabListLight}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <TabLabel>
                  <EventNote /> Pages
                </TabLabel>
              }
              value="pages"
            />
            {mimeType === MimeType.MARKDOWN ? (
              <Tab
                label={
                  <TabLabel>
                    <ListAlt /> H1
                  </TabLabel>
                }
                value="toc"
              />
            ) : undefined}
          </TabList>
        </Box>
        <TabPanel value="pages">
          <TabPanelHeader onClick={() => handleOpenRecents()} tools={openRecents ? <ExpandMore /> : <NavigateNext />}>
            <Mouse
              fontSize="small"
              style={{
                marginRight: 6,
              }}
            />
            Recents
          </TabPanelHeader>
          <Collapse in={openRecents} timeout="auto" unmountOnExit>
            <List
              style={{
                paddingTop: 0,
                paddingBottom: 0,
              }}
              dense
            >
              {recents?.map((it, index) => {
                if (!it) {
                  return null;
                }

                return (
                  <ListItem key={it.fileLink}>
                    <ListItemText
                      primary={it.name}
                      primaryTypographyProps={{
                        noWrap: true,
                        style: {
                          fontSize: '0.875rem',
                          paddingLeft: 28,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => {
                        navigate(it.fileLink);
                      }}
                    />
                    <IconButton size="small" onClick={() => handleDeleteRecentItem(index)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
          <Divider />

          {import.meta.env.DEV ? (
            <>
              <TabPanelHeader>
                <Star
                  fontSize="small"
                  style={{
                    marginRight: 6,
                  }}
                />{' '}
                Favorites
              </TabPanelHeader>
              {favorites.map((it) => {
                if (!it) {
                  return null;
                }

                if (it.type === 'link' && it.linkType === 'heading') {
                  return <HeadingItem key={it.id} item={it} level={0} loopType="favorite" />;
                }

                return it.type === 'group' ? (
                  <GroupView key={it.id} group={it} loopType="favorite" />
                ) : (
                  <SidebarItem key={it.id} item={it} level={0} loopType="favorite" />
                );
              })}
              <Divider />
            </>
          ) : undefined}

          <TabPanelHeader
            tools={
              <>
                {currentWorkspace === 'calendar' ? (
                  <Tooltip title="Open calendar">
                    <Button
                      startIcon={<CalendarMonth fontSize="small" />}
                      disableRipple
                      size="small"
                      onClick={() => setOpenCalendar((v) => !v)}
                    >
                      <Typography variant="subtitle2" color="GrayText">
                        {dayjs(selectedDate, 'YYYYMMDD').format('YYYY-MM-DD')}
                      </Typography>
                    </Button>
                  </Tooltip>
                ) : undefined}
                <PageButton
                  insertTarget="root"
                  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                />
              </>
            }
          >
            <WorkspaceButton />
          </TabPanelHeader>
          {currentWorkspace === 'calendar' ? (
            <div className={classes.timeline}>
              {openCalendar ? (
                <div className={classes.calendarArea}>
                  <BasicCalendar />
                </div>
              ) : undefined}
            </div>
          ) : undefined}
          <List dense>
            <LinkTreeView />
          </List>
          <Box height={100} />
        </TabPanel>

        {mimeType === MimeType.MARKDOWN ? <HeadingView /> : undefined}
      </TabContext>
    </Drawer>
  );
}
