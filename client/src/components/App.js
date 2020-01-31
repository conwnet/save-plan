/**
 * @file App
 * @author netcon
 */

import React, {useState, useMemo, useEffect} from 'react';
import Spin from 'antd/es/spin';
import SavePlan from './SavePlan';
import styles from './App.module.css';
import {getData} from '../api';
import 'antd/dist/antd.css';

const App = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    const sum = useMemo(() => {
        return Object.values(data)
            .reduce((prev, item) => {
                return prev += item.done ? item.value : 0;
            }, 0);
    }, [data]);

    useEffect(() => {
        getData().then(data => {
            setData(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <Spin tip="Loading..." size="large" />
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                Sum:
                <span className={styles.sum}>
                    ￥{sum}
                </span>
            </div>
            <SavePlan data={data} onDataChange={setData} />
        </div>
    );
};

export default App;
