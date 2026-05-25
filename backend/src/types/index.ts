export interface User {
  id:         number;
  email:      string;
  password:   string;
  name:       string;
  created_at: string;
}

export interface Folder {
  id:         number;
  name:       string;
  parent_id:  number | null;
  owner_id:   number;
  created_at: string;
}

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export interface JwtPayload {
  sub:   number;   // user id
  email: string;
  name:  string;
}