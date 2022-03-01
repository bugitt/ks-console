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
import classNames from 'classnames'
import { Icon } from '@kube-design/components'

import styles from './index.scss'

export default class Help extends React.Component {
  render() {
    const { className } = this.props
    return (
      <div className={classNames(styles.wrapper, className)}>
        <div className={styles.header}>
          <Icon name="question" size={24} />
          {t('TIPS')}
        </div>
        <div className={styles.tip}>
          <a
            href="https://scs.buaa.edu.cn/doc/cloud-labs/cloud/appendix_create_kubernetes/#kubekey%E6%8E%A8%E8%8D%90"
            target="_blank"
            rel="noreferrer noopener"
          >
            💁 {t('HOW_TO_INVITE_USERS')}
          </a>
        </div>
        <div className={styles.tip}>
          <a
            href="https://scs.buaa.edu.cn/doc/cloud-labs/cloud/appendix_create_kubernetes/#kubekey%E6%8E%A8%E8%8D%90"
            target="_blank"
            rel="noreferrer noopener"
          >
            💁 {t('HOW_TO_SET_PROJECT_GATEWAY')}
          </a>
        </div>
      </div>
    )
  }
}
