export type TicketType = "single" | "couple";

export interface Guest {
  id: string;
  display_name: string;
  slug: string;
  ticket_type: TicketType;
  places: number;
  phone: string;
  email?: string;
  table_number?: number | null;
  qr_code: string;
  is_checked_in: boolean;
  created_at: string;
  invitation_url: string;
}