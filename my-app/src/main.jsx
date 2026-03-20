import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import FLP360UI from './FLP360_UI_Mockups.jsx'
import CMS from './ai-translation-recommendation-tg-light.jsx'
import FLP360  from './FLP360_AI_Architecture_UI_v4.jsx'
import QR  from './QRProviderReport.jsx'
import QR_M_Path from './MiddlePathShowcase.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QR_M_Path />
  </StrictMode>,
)
