/* table-export — CSV / JSON download of visible table rows.
   Markup:
     <button class="brut-btn brut-table-export-btn"
             data-brut="table-export"
             data-brut-table="my-table"
             data-brut-format="csv"
             data-brut-filename="my-export">Export CSV</button>

   data-brut-table    — id of the target <table>
   data-brut-format   — "csv" (default) or "json"
   data-brut-filename — base filename (no extension); defaults to <table-id>-<yyyymmdd>

   Only visible rows are exported: rows with [hidden] or [data-brut-row-expansion]
   are skipped. Columns with display:none are skipped. Hidden inline-edit input
   values take precedence over cell textContent.

   Dispatches brut:change { format, rowCount } after a successful download. */
(function () {
  if (!window.Brut) return;

  function escapeCsv(v) {
    if (v == null) return '';
    var s = String(v);
    if (s.indexOf('"') !== -1 || s.indexOf(',') !== -1 || s.indexOf('\n') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function todayStamp() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  }

  Brut.register('table-export', {
    selector: '[data-brut="table-export"]',
    init: function (btn) {
      btn.setAttribute('type', 'button');
      var tableId = btn.getAttribute('data-brut-table');
      var table = tableId ? document.getElementById(tableId) : null;
      if (!table) return;
      var format = (btn.getAttribute('data-brut-format') || 'csv').toLowerCase();
      var base = btn.getAttribute('data-brut-filename') || (tableId + '-' + todayStamp());

      function build() {
        var headers = Array.prototype.slice.call(table.querySelectorAll('thead th'))
          .filter(function (th) { return th.offsetParent !== null; }) // skip column-hidden headers
          .map(function (th) { return (th.getAttribute('data-brut-col-label') || th.textContent || '').trim(); });
        var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'))
          .filter(function (tr) { return !tr.hasAttribute('hidden') && !tr.hasAttribute('data-brut-row-expansion'); })
          .map(function (tr) {
            return Array.prototype.slice.call(tr.children)
              .filter(function (td) { return td.offsetParent !== null; })
              .map(function (td) {
                // Prefer hidden inputs (committed inline-edit values) when present
                var hi = td.querySelector('input[type="hidden"][data-brut-edit-state]');
                if (hi) return hi.value;
                return (td.textContent || '').trim();
              });
          });
        if (format === 'json') {
          var arr = rows.map(function (r) {
            var obj = {};
            headers.forEach(function (h, i) { obj[h] = r[i]; });
            return obj;
          });
          return { mime: 'application/json', body: JSON.stringify(arr, null, 2), ext: 'json', count: arr.length };
        } else {
          var csv = [headers.map(escapeCsv).join(',')]
            .concat(rows.map(function (r) { return r.map(escapeCsv).join(','); }))
            .join('\n');
          return { mime: 'text/csv', body: csv, ext: 'csv', count: rows.length };
        }
      }

      btn.addEventListener('click', function () {
        var out = build();
        var blob = new Blob([out.body], { type: out.mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = base + '.' + out.ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        btn.dispatchEvent(new CustomEvent('brut:change', {
          detail: { format: format, rowCount: out.count },
          bubbles: true
        }));
      });
    }
  });
})();
