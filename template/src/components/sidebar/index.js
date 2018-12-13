import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';

import SettingsIcon from '@material-ui/icons/SettingsSharp';

import connectComponent from '../../helpers/connect-component';

import WorkspaceSelector from './workspace-selector';

import {
  requestShowPreferencesWindow,
  requestCreateWorkspace,
  requestSetActiveWorkspace,
  requestRemoveWorkspace,
  requestShowEditWorkspaceWindow,
} from '../../senders';

const { remote } = window.require('electron');

const styles = theme => ({
  root: {
    height: '100vh',
    width: 68,
    borderRight: '1px solid rgba(0, 0, 0, 0.2)',
    backgroundColor: theme.palette.background.paper,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.unit,
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  top: {
    flex: 1,
    paddingTop: theme.spacing.unit * 2,
  },
});

const getWorkspacesAsList = workspaces => Object.values(workspaces)
  .sort((a, b) => a.order - b.order);

const Sidebar = ({ classes, workspaces }) => (
  <div className={classes.root}>
    <div className={classes.top}>
      {getWorkspacesAsList(workspaces).map(workspace => (
        <WorkspaceSelector
          active={workspace.active}
          id={workspace.id}
          key={workspace.id}
          name={workspace.name}
          order={workspace.order}
          onClick={() => requestSetActiveWorkspace(workspace.id)}
          onContextMenu={(e) => {
            e.preventDefault();

            const template = [
              {
                label: 'Edit Workspace',
                click: () => requestShowEditWorkspaceWindow(workspace.id),
              },
              {
                label: 'Remove Workspace',
                click: () => requestRemoveWorkspace(workspace.id),
              },
            ];
            const menu = remote.Menu.buildFromTemplate(template);

            menu.popup(remote.getCurrentWindow());
          }}
        />
      ))}
      {Object.keys(workspaces).length < 9 && (
        <WorkspaceSelector id="add" onClick={requestCreateWorkspace} />
      )}
    </div>
    <div className={classes.end}>
      <IconButton aria-label="Preferences" onClick={requestShowPreferencesWindow}>
        <SettingsIcon />
      </IconButton>
    </div>
  </div>
);

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  workspaces: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  workspaces: state.workspaces,
});

export default connectComponent(
  Sidebar,
  mapStateToProps,
  null,
  styles,
);
