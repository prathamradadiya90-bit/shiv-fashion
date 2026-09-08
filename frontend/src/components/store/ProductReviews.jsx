import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Star, ThumbsUp, ImageIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ProductReviews = ({ product, onReviewAdded }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { url: data.url, publicId: data.publicId };
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    if (!comment.trim()) return toast.error('Please write a comment');
    
    setSubmitting(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating,
        comment,
        images
      });
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      setImages([]);
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (reviewId) => {
    if (!userInfo) return toast.error('Please login to upvote');
    try {
      await api.post(`/products/reviews/${reviewId}/upvote`);
      if (onReviewAdded) onReviewAdded(); // Refresh reviews
    } catch (error) {
      toast.error('Failed to upvote review');
    }
  };

  return (
    <div className="mt-12 border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-bold font-heading mb-8">Customer Reviews</h2>
      
      {/* Review Summary */}
      <div className="flex items-center gap-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900">{product.rating ? Number(product.rating).toFixed(1) : '0.0'}</div>
          <div className="flex text-amber-400 my-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
            ))}
          </div>
          <div className="text-xs text-slate-500">{product.numReviews} Reviews</div>
        </div>
        <div className="flex-1 px-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            These reviews are collected from verified buyers who purchased this product.
          </p>
        </div>
      </div>

      {/* Review Submission Form */}
      {userInfo ? (
        <form onSubmit={submitReview} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <h3 className="text-lg font-bold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
                >
                  <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this product?"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-[#800020] outline-none"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Add Photos (Optional)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={img.url} alt="Review upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-[#800020] hover:border-[#800020] cursor-pointer transition-colors bg-slate-50">
                <ImageIcon size={20} className="mb-1" />
                <span className="text-[10px] font-bold">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {uploading && <div className="text-xs text-[#800020] animate-pulse">Uploading images...</div>}
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="bg-[#800020] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-[#500014] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center mb-10">
          <p className="text-slate-600 mb-3 text-sm">Please login to write a review for this product.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{review.user?.name || 'Anonymous'}</div>
                    <div className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-slate-700 leading-relaxed mb-3 mt-3">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {review.images.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer">
                      <img src={img.url} alt="Review attachment" className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                <button 
                  onClick={() => handleUpvote(review.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#800020] transition-colors"
                >
                  <ThumbsUp size={14} /> 
                  <span className="font-semibold">{review.upvotes || 0}</span> Helpful
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Star size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No reviews yet</h3>
            <p className="text-sm text-slate-500">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
