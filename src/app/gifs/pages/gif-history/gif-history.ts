import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { GifService } from '../../services/gifs.service';
import { GifList } from "../../components/gif-list/gif-list";

@Component({
  selector: 'app-gif-history',
  imports: [GifList],
  templateUrl: './gif-history.html'
})

export default class GifHistory {

  gifService = inject(GifService);

  query = toSignal(
    inject(ActivatedRoute).params.pipe(
       map(({ query }) => query)
    ));

  gifsByKey = computed(() => {
    return this.gifService.getHistoryGifs(this.query());
  });
}
