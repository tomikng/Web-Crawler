import React from 'react';
import './NodeDetail.css';
import { useLocation } from 'react-router-dom';

const NodeDetail = () => {

    const location = useLocation();
    const data = location.state.data;

    console.log(data);
    return (
        <div>{data.label}</div>
    )
};

export default NodeDetail;
