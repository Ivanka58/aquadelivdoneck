// reviews.js — работа с отзывами через Supabase

// Эти значения будут подставлены через GitHub Actions
window.SUPABASE_URL = 'https://ewmfkxcdguaopinwqrvp.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_Tyn0nXY3Qw2iKgVk8FnVKw_MdsNCDL3';

window.ReviewsAPI = {
    supabase: null,
    currentUserIP: null,

    async init(url, key) {
        if (!window.supabase) {
            console.error('Supabase SDK не загружен');
            return false;
        }
        this.supabase = window.supabase.createClient(url, key);
        await this.getUserIP();
        return true;
    },

    async getUserIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            this.currentUserIP = data.ip;
        } catch (e) {
            console.warn('IP не определён', e);
            this.currentUserIP = 'unknown';
        }
    },

    async fetchReviews() {
        if (!this.supabase) return [];
        const { data, error } = await this.supabase
            .from('reviews')
            .select('*')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });
        if (error) return [];
        return data;
    },

    async addReview(username, rating, comment) {
        if (!this.supabase) return { success: false };
        const { data, error } = await this.supabase
            .from('reviews')
            .insert([{
                username: username.trim(),
                rating: rating,
                comment: comment?.trim() || null,
                user_ip: this.currentUserIP
            }])
            .select();
        if (error) return { success: false, error: error.message };
        return { success: true, data: data[0] };
    },

    async deleteReview(reviewId) {
        if (!this.supabase) return { success: false };
        
        // Проверяем, что отзыв принадлежит этому IP
        const { data: review, error: fetchError } = await this.supabase
            .from('reviews')
            .select('user_ip')
            .eq('id', reviewId)
            .single();
        
        if (fetchError || !review) return { success: false, error: 'Отзыв не найден' };
        if (review.user_ip !== this.currentUserIP) return { success: false, error: 'Можно удалять только свои отзывы' };
        
        const { error } = await this.supabase
            .from('reviews')
            .update({ is_deleted: true })
            .eq('id', reviewId);
        
        if (error) return { success: false, error: error.message };
        return { success: true };
    }
};
