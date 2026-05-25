# Windows Explorer

## Description

Create a Windows Explorer-like web page. The page is split horizontally into two panels. The left panel contains the folder structure, and the right panel contains the direct sub folders for the selected folder on the left panel.
Upon load, the frontend requests the data from the backend and displays the complete folder structure (all folders) on the left panel with nothing on the right panel. Folder can have unlimited [subfolders. The subfolders can have unlimited levels. Upon clicking one of the folders on the left panel, the right panel displays the list of direct sub folders of the clicked folder.

## Backend 
1. Framework : Elysia ( Typescript )
2. Database : Postrgree SQL
3. Feature Service ( Module Service Arch )

### How To Run 
> cd backend
> bun install
> bun run dev

## Frontend : 
1. Vue 3
