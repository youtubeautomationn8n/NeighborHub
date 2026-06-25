import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('trust_score', { ascending: false })
      .then(({ data }) => {
        setProfiles((data as Profile[]) || []);
        setLoading(false);
      });
  }, []);

  const allSkills = Array.from(new Set(profiles.flatMap((p) => p.skills))).sort();

  const filtered = profiles.filter((p) => {
    if (verifiedOnly && !p.verified) return false;
    if (skillFilter !== 'all' && !p.skills.includes(skillFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q) || p.skills.some((s) => s.includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Community Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Connect with neighbors, volunteers, and local businesses</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, or bio..."
          className="input flex-1"
        />
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`btn-outline shrink-0 ${verifiedOnly ? 'border-secondary-400 text-secondary-600' : ''}`}
        >
          <BadgeCheck className="w-4 h-4" /> Verified only
        </button>
      </div>

      {/* Skill filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        <button onClick={() => setSkillFilter('all')} className={`chip shrink-0 ${skillFilter === 'all' ? 'chip-active' : 'chip-inactive'}`}>All Skills</button>
        {allSkills.map((skill) => (
          <button key={skill} onClick={() => setSkillFilter(skill)} className={`chip shrink-0 capitalize ${skillFilter === skill ? 'chip-active' : 'chip-inactive'}`}>
            {skill}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/profile/${p.id}`} className="card card-hover p-5 group">
              <div className="flex items-start gap-4">
                <img
                  src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`}
                  alt={p.name}
                  className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    {p.verified && <BadgeCheck className="w-4 h-4 text-secondary-500 shrink-0" />}
                  </div>
                  {p.area && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {p.area}
                    </p>
                  )}
                  {p.bio && <p className="text-xs text-gray-500 line-clamp-2 mt-1.5">{p.bio}</p>}
                </div>
              </div>
              {p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Star className="w-3.5 h-3.5 fill-current" /> {p.trust_score}% trust
                </div>
                <button className="btn-ghost p-1.5 text-xs">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
