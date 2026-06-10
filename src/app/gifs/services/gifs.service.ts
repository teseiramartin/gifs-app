import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { GifMapper } from '../mapper/gif.mapper';
import { Gif } from './../interfaces/gif.interface';

// {
//   'goku': [Gif1, Gif2, Gif3], 
//   'naruto': [Gif1, Gif2, Gif3],
//   'one punch': [Gif1, Gif2, Gif3],
// }

// Record<string, Gif[]>

const GIFS_KEY = 'gifs';

const loadFromLocalStorage = () => {
  const gifsFromStorage = localStorage.getItem(GIFS_KEY) ?? '{}';
  const gifs = JSON.parse(gifsFromStorage);
  return gifs;
}

@Injectable({ providedIn: 'root' })
export class GifService {

  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  /*saveLocalStorageHistory(searchHistory: Record<string, Gif[]> = this.searchHistory()) {
    const history = searchHistory ? searchHistory : this.searchHistory();
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }*/

  saveGifsToLocalStorage = effect(() => {
    const history = this.searchHistory();
    localStorage.setItem(GIFS_KEY, JSON.stringify(history));
  });

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs() {
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        rating: 'g'
      }
    }).subscribe((resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      console.log(gifs);
      this.trendingGifs.set(gifs);
      this.trendingGifsLoading.set(false);
    });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
      params: {
        api_key: environment.giphyApiKey,
        q: query,
        limit: 20,
        rating: 'r'
      }
    })
    .pipe(
      map(({data}) => data),
      map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
      tap((items) => {
        this.searchHistory.update((history) => {
          const newHistory = {
            ...history,
            [query.toLocaleLowerCase()]: items
          };
          return newHistory;
        });
      })
    );
    // .subscribe((resp) => {
    //   const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
    //   console.log({search: gifs});
    // });
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

}
