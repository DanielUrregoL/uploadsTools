import React from 'react'
import { useState } from 'react'
import Spinner from 'react-bootstrap/Spinner'

function Footer(isUploading) {
    
    return (
        <footer>
            {isUploading ? <Spinner animation="border" /> : null}
            <p style={{ fontSize: '16px' }} >@By Daniel UL</p>
        </footer>
    )
}

export default Footer