import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function TourForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    maxGroupSize: '',
    difficulty: 'medium',
    price: '',
    summary: '',
    description: '',
    secretTour: false,
    startLocation: { description: '', coordinates: [0, 0], address: '' },
    locations: [],
    startDates: [],
  });

  const [imageCover, setImageCover] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLocType, _setActiveLocType] = useState('start'); // 'start' or index of locations
  const activeLocTypeRef = useRef('start');
  const [newDate, setNewDate] = useState('');

  const setActiveLocType = (val) => {
    _setActiveLocType(val);
    activeLocTypeRef.current = val;
  };

  useEffect(() => {
    if (isEdit) {
      const loadTour = async () => {
        try {
          const { data } = await api(`/api/v1/tours/${id}`);
          const tour = data.doc;
          setFormData({
            name: tour.name,
            duration: tour.duration,
            maxGroupSize: tour.maxGroupSize,
            difficulty: tour.difficulty,
            price: tour.price,
            summary: tour.summary,
            description: tour.description,
            secretTour: tour.secretTour,
            startLocation: tour.startLocation || { description: '', coordinates: [0, 0], address: '' },
            locations: tour.locations || [],
            startDates: (tour.startDates || []).map(d => d.split('T')[0]),
          });
        } catch (err) {
          setError(err.message);
        }
      };
      loadTour();
    }
  }, [id, isEdit]);

  // Leaflet initialization
  useEffect(() => {
    if (!window.L || !document.getElementById('form-map')) return;

    if (!mapRef.current) {
      mapRef.current = L.map('form-map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Use the Ref to avoid stale closure of activeLocType
        updateCoordinates(lng, lat, activeLocTypeRef.current);
      });
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Add Start Location Marker
    if (formData.startLocation.coordinates[0] !== 0 || formData.startLocation.coordinates[1] !== 0) {
      markersRef.current.start = L.marker([formData.startLocation.coordinates[1], formData.startLocation.coordinates[0]], {
        icon: L.divIcon({ className: 'bg-primary-200 border-white border-2 rounded-full w-4 h-4 shadow-md' })
      })
      .addTo(mapRef.current)
      .bindPopup('Start Location');
    }

    // Add Tour Stop Markers
    formData.locations.forEach((loc, i) => {
      if (loc.coordinates[0] !== 0 || loc.coordinates[1] !== 0) {
        markersRef.current[`loc-${i}`] = L.marker([loc.coordinates[1], loc.coordinates[0]])
        .addTo(mapRef.current)
        .bindPopup(`Stop ${i + 1}: ${loc.description || 'No description'}`);
      }
    });

    return () => {
      // Cleanup map if needed, but usually better to keep it if component stays
    };
  }, [formData.startLocation.coordinates, formData.locations]);

  const updateCoordinates = (lng, lat, locIndex) => {
    setFormData(prev => {
      if (locIndex === 'start') {
        return {
          ...prev,
          startLocation: { ...prev.startLocation, coordinates: [lng, lat] }
        };
      } else {
        const newLocs = [...prev.locations];
        newLocs[locIndex] = { ...newLocs[locIndex], coordinates: [lng, lat] };
        return { ...prev, locations: newLocs };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('startLocation.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        startLocation: { ...prev.startLocation, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const addDate = () => {
    if (!newDate) return;
    setFormData(prev => ({ ...prev, startDates: [...prev.startDates, newDate].sort() }));
    setNewDate('');
  };

  const removeDate = (date) => {
    setFormData(prev => ({ ...prev, startDates: prev.startDates.filter(d => d !== date) }));
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, { description: '', day: '', coordinates: [0, 0] }]
    }));
    setActiveLocType(formData.locations.length);
  };

  const removeLocation = (index) => {
    setFormData(prev => ({ ...prev, locations: prev.locations.filter((_, i) => i !== index) }));
    setActiveLocType('start');
  };

  const handleLocChange = (index, field, value) => {
    setFormData(prev => {
      const newLocs = [...prev.locations];
      newLocs[index] = { ...newLocs[index], [field]: value };
      return { ...prev, locations: newLocs };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'imageCover') {
      setImageCover(e.target.files[0]);
    } else {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (['startLocation', 'locations', 'startDates'].includes(key)) {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    if (imageCover) data.append('imageCover', imageCover);
    images.forEach((img) => data.append('images', img));

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit ? `/api/v1/tours/${id}` : '/api/v1/tours';
      await api(url, {
        method,
        body: data,
      });
      navigate('/manage-tours');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="mx-auto max-w-[114rem] bg-white shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.06)] p-[5rem_7rem] rounded-[5px]">
        <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] mb-[3.5rem] inline-block">{isEdit ? 'Edit Tour' : 'Create New Tour'}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-[6rem]">
          {/* Column 1: Basic Info */}
          <div className="flex flex-col gap-[2.5rem]">
            {error && <div className="p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">{error}</div>}

            <div>
              <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Tour Name</label>
              <input name="name" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-[2.5rem]">
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Duration (days)</label>
                <input name="duration" type="number" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.duration} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Max Group Size</label>
                <input name="maxGroupSize" type="number" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.maxGroupSize} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2.5rem]">
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Difficulty</label>
                <select name="difficulty" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.difficulty} onChange={handleChange}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Price</label>
                <input name="price" type="number" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.price} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Summary</label>
              <textarea name="summary" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.summary} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Description</label>
              <textarea name="description" className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" value={formData.description} onChange={handleChange} rows="5" />
            </div>

            {/* Start Dates */}
            <div>
              <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Start Dates</label>
              <div className="flex gap-[1rem] mb-[1.5rem]">
                <input type="date" className="flex-1 p-[1rem] border-none bg-grey-400 rounded-[4px] focus:outline-none" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                <button type="button" onClick={addDate} className="bg-primary-200 text-white p-[1rem_2rem] rounded-[4px] uppercase text-[1.2rem] font-bold">Add</button>
              </div>
              <div className="flex flex-wrap gap-[1rem]">
                {formData.startDates.map(date => (
                  <span key={date} className="bg-grey-400 p-[0.5rem_1.2rem] rounded-[10rem] text-[1.3rem] flex items-center gap-[0.8rem]">
                    {date}
                    <button type="button" onClick={() => removeDate(date)} className="text-[#eb4d4b] font-bold hover:scale-110">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2.5rem]">
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Cover Image</label>
                <input name="imageCover" type="file" className="block text-[1.4rem] w-full" onChange={handleFileChange} accept="image/*" />
              </div>
              <div>
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Tour Photos (up to 3)</label>
                <input name="images" type="file" className="block text-[1.4rem] w-full" onChange={handleFileChange} multiple accept="image/*" />
              </div>
            </div>

            <div>
              <label className="flex items-center text-[1.6rem] font-bold cursor-pointer">
                <input name="secretTour" type="checkbox" checked={formData.secretTour} onChange={handleChange} className="h-[2rem] w-[2rem] accent-primary-200 mr-[1rem]" />
                <span>Secret Tour</span>
              </label>
            </div>
          </div>

          {/* Column 2: Map & Locations */}
          <div className="flex flex-col gap-[2.5rem]">
            <h3 className="text-[1.8rem] font-bold uppercase text-primary-200 border-b border-grey-400 pb-[1rem]">Interactive Map Navigator</h3>
            <div id="form-map" className="h-[35rem] w-full rounded-[1rem] bg-grey-400 shadow-inner overflow-hidden border border-grey-400" style={{ zIndex: 1 }}></div>
            <p className="text-[1.3rem] text-grey-500 italic font-medium">Click on the map to set coordinates for the selected location field below.</p>

            <div className="p-[2.5rem] bg-primary-20 rounded-[1rem] border border-primary-100/20">
              <div className="flex justify-between items-center mb-[2rem]">
                <h4 className="text-[1.6rem] font-bold uppercase">Locations & Stops</h4>
                <button type="button" onClick={addLocation} className="text-white bg-primary-200 text-[1.2rem] p-[0.6rem_2rem] rounded-full font-bold uppercase transition-transform hover:scale-105 active:scale-95">Add Stop</button>
              </div>

              {/* Start Location */}
              <div className={`mb-[2rem] p-[1.5rem] rounded-[8px] transition-all cursor-pointer ${activeLocType === 'start' ? 'ring-2 ring-primary-200 bg-white' : 'bg-white/50 hover:bg-white'}`} onClick={() => setActiveLocType('start')}>
                <div className="flex justify-between mb-[1rem]">
                  <span className="text-[1.4rem] font-bold uppercase text-primary-200">Start Location</span>
                  <span className="text-[1.2rem] text-grey-500">[{formData.startLocation.coordinates.map(c => c.toFixed(2)).join(', ')}]</span>
                </div>
                <input name="startLocation.description" placeholder="Short description (e.g. Miami, USA)" className="w-full text-[1.4rem] p-[1rem] bg-grey-100 rounded border-none focus:ring-0" value={formData.startLocation.description} onChange={handleChange} />
              </div>

              {/* Dynamic Stops */}
              <div className="flex flex-col gap-[1.5rem] max-h-[40rem] overflow-y-auto pr-[1rem]">
                {formData.locations.map((loc, i) => (
                  <div key={i} className={`p-[1.5rem] rounded-[8px] transition-all cursor-pointer relative ${activeLocType === i ? 'ring-2 ring-primary-200 bg-white shadow-md' : 'bg-white/50 hover:bg-white'}`} onClick={() => setActiveLocType(i)}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeLocation(i); }} className="absolute -top-[1rem] -right-[1rem] bg-[#eb4d4b] text-white w-[2.25rem] h-[2.25rem] rounded-full flex items-center justify-center text-[1.2rem] font-bold shadow-md">×</button>
                    <div className="flex justify-between mb-[1rem]">
                      <span className="text-[1.4rem] font-bold uppercase">Tour Stop {i + 1}</span>
                      <span className="text-[1.2rem] text-grey-500">[{loc.coordinates.map(c => c.toFixed(2)).join(', ')}]</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-[1rem]">
                      <input placeholder="Location description" className="text-[1.4rem] p-[1rem] bg-grey-100 rounded border-none focus:ring-0" value={loc.description} onChange={(e) => handleLocChange(i, 'description', e.target.value)} />
                      <input placeholder="Day" className="w-[6rem] text-center text-[1.4rem] p-[1rem] bg-grey-100 rounded border-none focus:ring-0" value={loc.day} onChange={(e) => handleLocChange(i, 'day', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-grey-400">
              <button className="w-full text-[1.6rem] py-[1.6rem] px-[4rem] rounded-[10rem] uppercase transition-all duration-300 font-bold bg-primary-200 text-white hover:bg-primary-300 hover:shadow-btn active:scale-[0.98] disabled:bg-grey-500" disabled={loading}>
                {loading ? 'Saving Tour...' : 'Save & Publish Tour'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
