/**
 * @file Save Plan Components
 * @author netcon
 */

import React, {useCallback} from 'react';
import classNames from 'classnames';
import moment from 'moment';
import Icon from 'antd/es/icon';
import Calendar from 'antd/es/calendar';
import Modal from 'antd/es/modal';
import {updateData} from '../../api';
import styles from './index.module.css';

const now = moment();
const year = moment().year();
const months = [31, now.isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const validRange = [moment(`${year}-01-01`), moment(`${year}-12-31`)];

const SavePlan = ({data, onDataChange}) => {
    const dateCellRender = useCallback(value => {
        const key = value.format('YYYY-MM-DD');
        const cell = data[key];

        if (!cell) {
            return null;
        }

        const toggleStatus = () => {
            const toggle = () => {
                updateData(key).then(data => {
                    onDataChange && onDataChange(data);
                });
            }
            Modal.confirm({
                title: 'Confirm',
                content: 'Are you sure?',
                maskClosable: true,
                onOk: toggle,
            });
        };

        return (
            <div className={classNames(styles.date, {[styles.done]: cell.done})} onClick={toggleStatus}>
                <div className={styles.status}>
                    {cell.done ? (
                        <Icon type="heart" theme="filled" style={{color: '#f6b'}} />
                    ) : (
                        <Icon type="heart" theme="twoTone" twoToneColor="#ccc" />
                    )}
                    <span className={styles.text}>
                        {cell.done ? 'DONE' : 'TODO'}
                    </span>
                </div>
                <div className={classNames(styles.value, {[styles.done]: cell.done})}>
                    ￥{cell.value}
                </div>
            </div>
        )
    }, [data, onDataChange]);

    const monthCellRender = useCallback(value => {
        const keyPrefix = value.format('YYYY-MM');
        const dayCount = months[value.month()];

        const [times, sum] = Object.entries(data).reduce((prev, item) => {
            const [key, value] = item;
            if (key.startsWith(keyPrefix) && value.done) {
                return [prev[0] + 1, prev[1] + value.value];
            }
            return prev;
        }, [0, 0]);

        return (
            <div className={styles.month}>
                <div>Progress: {times} / {dayCount}</div>
                <div className={styles.sum}>Sum: {sum}</div>
            </div>
        );
    }, [data]);

    return (
        <Calendar
            validRange={validRange}
            dateCellRender={dateCellRender}
            monthCellRender={monthCellRender}
        />
    );
};

export default SavePlan;
