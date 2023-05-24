import React from 'react';
import './NodeDetail.css';
import { useLocation } from 'react-router-dom';
import Crawl from '../Crawl/Crawl';


const handleNewExecutionClick = () => {
    console.log("Hello");
}

const NodeDetail = () => {
    const location = useLocation();
    const data = location.state.data;
    const type = location.state.nodeStyle;

    const formattedDate = new Date(data.crawlTime).toLocaleString();

    if (type === 'customNode') {
        return (
            <Crawl initialUrl={data.url}/>
        );
    } else {
        return (
            <div id="node-details-container">

                <button className="new-execution-button" onClick={handleNewExecutionClick}>
                        New Execution
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
