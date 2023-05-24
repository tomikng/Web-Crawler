import React from 'react';
import './NodeDetail.css';
import { useLocation } from 'react-router-dom';
import Crawl from '../Crawl/Crawl';

const NodeDetail = () => {

    const location = useLocation();
    const data = location.state.data;
    const type = location.state.nodeStyle;


     if (type === 'customNode') {
        return (
            <Crawl initialUrl={data.url}/>
        );
    } else {
        return (
            <div>
                <h1>Crawled</h1>
            </div>
        );
    }

};

export default NodeDetail;
