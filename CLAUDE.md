# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 51talk user interview invitation H5 (mobile web page) project. The goal is to create an elegant mobile invitation page for an offline user interview event on November 29, 2025, where participants will receive an 800 yuan interview compensation.

## Architecture

This is currently a requirements-only project with the following structure:
- `需求文档.md` - Detailed product requirements document (in Chinese)
- `logo.png` - 51talk company logo

The project requires implementation of:
1. **Frontend (H5 mobile page)**: Responsive invitation page with form submission
2. **Backend**: Simple admin interface for data management and export

## Key Requirements

### Frontend Features
- Mobile-first responsive design (WeChat browser optimized)
- Visual sections: invitation message, compensation details, event info, map integration
- Interactive form with:
  - Name input field (required)
  - Time slot selection (AM/PM radio buttons)
  - Submit validation and success confirmation popup
- Map integration linking to Baidu Maps navigation
- Custom WeChat sharing metadata

### Backend Features
- Simple data storage with fields: id, user_name, selected_slot, submit_time, ip_address
- Admin dashboard to view submitted registrations
- Excel export functionality for event check-in

## Technical Specifications

- Event Date: November 29, 2025 (Saturday)
- Location: 北京市朝阳区东大桥路8号尚都国际中心A座2808
- Map Navigation URL: `https://j.map.baidu.com/fc/dcN`
- Compensation: 800 yuan per participant
- Time Slots: 9:30-11:30 AM / 2:00-4:00 PM

## Development Notes

- Priority on mobile performance and WeChat browser compatibility
- Form submission should include debouncing to prevent duplicate entries
- Map link must be tested in WeChat environment
- Images should be compressed for fast loading on mobile networks
- Share card customization required for WeChat sharing