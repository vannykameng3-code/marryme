export interface Wedding {
  id: string;
  title: string;
  host_username: string;
  khqr_img_url: string;
  created_at: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  phone: string;
  companions: number;
  relation_type: string;
  amount: number;
  note: string;
  status: 'pending' | 'approved';
  created_at: string;
}
