import { Gif } from './../interfaces/gif.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { GifMapper } from '../mapper/gif.mapper';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GifService {

  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(true);

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

  searchGifs(query: string) {
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
      map((items) => GifMapper.mapGiphyItemsToGifArray(items))

      //TODO: agregar historial de busqueda
    );
    // .subscribe((resp) => {
    //   const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
    //   console.log({search: gifs});
    // });
  }

}
