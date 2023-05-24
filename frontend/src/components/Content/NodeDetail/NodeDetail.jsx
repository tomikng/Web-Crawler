import React from 'react';
import './NodeDetail.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Crawl from '../Crawl/Crawl';
import axios from 'axios';

const base_url = 'http://127.0.0.1:8000/api';

const NodeDetail = () => {
    const location = useLocation();
    const data = location.state.data;
    const type = location.state.nodeStyle;
    const navigate = useNavigate();

    const formattedDate = new Date(data.crawlTime).toLocaleString();

    const handleNewExecutionClick = async (id) => {
        try {
            await axios.post(`${base_url}/executions/create/${id}/`);
            alert('Execution created successfully');
            navigate(`/crawledPages/${id}/`);
        } catch (error) {
            console.error('Error creating execution:', error);
        }
    }

    if (type === 'customNode') {
        return (
            <Crawl initialUrl={data.url}/>
        );
    } else {
        return (
            <div id="node-details-container">

                <button className="new-execution-button" onClick={() => handleNewExecutionClick(data.owner.identifier)}>
                    Execute
                </button>

                <h1 className="node-detail-title">Node Detail</h1>
                <h2>URL:</h2>
                <p className="node-detail-url">{data.url}</p>
                <h2>Crawl time:</h2>
                <p className="node-detail-time">{formattedDate}</p>
                <h2>Links:</h2>
                <table id="links-table">
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.links && data.links.map((link, index) => (
                            <tr key={index}>
                                <td>{link.url}</td>
                                <td>{link.title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
};

export default NodeDetail;
