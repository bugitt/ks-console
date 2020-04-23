/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { get, isObject } from 'lodash'
import { parse } from 'qs'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import moment from 'moment-mini'
import { Tabs, Columns, Column, Loading } from '@pitrix/lego-ui'

import { ReactComponent as BackIcon } from 'src/assets/back-white.svg'
import { Button, Modal, Image } from 'components/Base'
import AppDeployForm from 'components/Forms/AppTemplate'
import VersionStore from 'stores/openpitrix/version'
import AppStore from 'stores/openpitrix/app'

import Banner from 'appStore/components/Banner'
import AppInfo from 'appStore/components/AppInfo'
import AppPreview from 'appStore/components/AppPreview'
import AppBase from 'appStore/components/AppBase'
import VersionSelect from 'apps/components/VersionSelect'

import styles from './index.scss'

const { TabPanel } = Tabs

@inject('rootStore')
@observer
export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.params = parse(location.search.slice(1)) || {}
    this.htmlOrigBgColor = ''

    this.state = {
      tab: 'appInfo',
      selectAppVersion: '',
      showDeploy: false,
    }

    this.appID = this.props.match.params.appID
    this.appStore = new AppStore()
    this.versionStore = new VersionStore()
  }

  get routing() {
    return this.props.rootStore.routing
  }

  get loggedIn() {
    return Boolean(globals.user)
  }

  get versionOptions() {
    const versions = this.versionStore.list.data
    return versions.map(({ version_id, name, create_time }) => ({
      label: name,
      time: moment(create_time).format(t('YYYY-MM-DD')),
      value: version_id,
    }))
  }

  componentDidMount() {
    this.fixBodyColor()
    this.getData()
  }

  componentWillUnmount() {
    // restore bg color
    document.querySelector('html').style.backgroundColor = this.htmlOrigBgColor
  }

  getData() {
    this.appStore.fetchDetail({ app_id: this.appID })

    this.versionStore
      .fetchList({
        app_id: this.appID,
        status: 'active',
      })
      .then(() => {
        const selectAppVersion = get(
          this.versionStore,
          'list.data[0].version_id',
          ''
        )
        this.setState({ selectAppVersion })
      })
  }

  fetchVersions = async (params = {}) => {
    await this.versionStore.fetchList({
      ...params,
      app_id: this.appID,
    })
  }

  handleTabChange = tab => {
    this.setState({ tab })
  }

  fixBodyColor() {
    const htmlElem = document.querySelector('html')
    this.htmlOrigBgColor = window.getComputedStyle(htmlElem).backgroundColor
    htmlElem.style.backgroundColor = 'white'
  }

  showDeploy = () => {
    if (!this.loggedIn) {
      location.href = `/login?referer=${location.pathname}`
    } else {
      this.setState({ showDeploy: true })
    }
  }

  hideDeploy = () => {
    this.setState({ showDeploy: false })
  }

  handleDeploy = params => {
    const { cluster, workspace, namespace, ...rest } = params
    this.appStore.deploy(rest, { namespace }).then(() => {
      this.hideDeploy()
      this.routing.push(
        `/cluster/${cluster}/projects/${namespace}/applications/template`
      )
    })
  }

  changeTab = tab => {
    this.setState({
      selectTab: tab,
    })
  }

  handleChangeAppVersion = version => {
    this.params.version = version
    this.setState({ selectAppVersion: version })
  }

  renderAppFilePreview() {
    const { selectAppVersion } = this.state

    return <AppPreview versionId={selectAppVersion} appId={this.appID} />
  }

  renderKeywords() {
    const { detail } = this.appStore
    let { keywords = '' } = detail
    keywords = keywords
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)

    return (
      <div className={styles.keywords}>
        <h3>{t('Keywords')}</h3>
        <p>
          {keywords.length === 0
            ? t('None')
            : keywords.map((v, idx) => <label key={idx}>{v}</label>)}
        </p>
      </div>
    )
  }

  renderDeployModal() {
    return (
      <Modal
        width={1162}
        visible={this.state.showDeploy}
        hideHeader
        hideFooter
        className={styles.deployModal}
      >
        <AppDeployForm
          app={this.appStore.detail}
          onOk={this.handleDeploy}
          onCancel={this.hideDeploy}
          isSubmitting={this.appStore.isSubmitting}
          params={this.params}
        />
      </Modal>
    )
  }

  renderTopIntro() {
    const { detail } = this.appStore
    if (!(isObject(detail) && 'name' in detail)) {
      return null
    }

    const { name, description, icon } = detail

    return (
      <div className={styles.intro}>
        <span className={styles.icon}>
          <Image iconSize={48} iconLetter={name} src={icon} alt="" />
        </span>
        <div className={styles.text}>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
    )
  }

  renderDeployButton() {
    return (
      <div className={styles.deployButton}>
        <Button type="control" onClick={this.showDeploy} noShadow>
          {t('Deploy')}
        </Button>
      </div>
    )
  }

  renderContent() {
    const { tab } = this.state
    const { detail, isLoading } = this.appStore
    const { data } = this.versionStore.list

    if (isLoading) {
      return <Loading className={styles.loading} />
    }

    return (
      <Tabs
        className="tabs-app"
        activeName={tab}
        onChange={this.handleTabChange}
      >
        <TabPanel label={t('App Info')} name="appInfo">
          {this.renderDeployButton()}
          <Columns>
            <Column className="is-8">
              <AppInfo app={detail} versions={toJS(data)} />
            </Column>
            <Column>
              <AppBase app={detail} />
            </Column>
          </Columns>
        </TabPanel>
        <TabPanel label={t('Version')} name="versions">
          {this.renderDeployButton()}
          <Columns>
            <Column className="is-8">{this.renderAppFilePreview()}</Column>
            <Column>
              <VersionSelect
                versionStore={this.versionStore}
                selectVersion={this.state.selectAppVersion}
                fetchVersions={this.fetchVersions}
                handleChangeVersion={this.handleChangeAppVersion}
              />
              {this.renderKeywords()}
            </Column>
          </Columns>
        </TabPanel>
      </Tabs>
    )
  }

  render() {
    return (
      <div className={styles.main}>
        <Banner className={styles.banner}>
          <div className={styles.appOutline}>
            <div className={styles.back}>
              <Link className="custom-icon" to={'/apps'}>
                <BackIcon width={16} height={16} />
                <span>{t('Back')}</span>
              </Link>
            </div>
            {this.renderTopIntro()}
          </div>
        </Banner>

        <div className={styles.content}>
          {this.renderContent()}
          {this.renderDeployModal()}
        </div>
      </div>
    )
  }
}
