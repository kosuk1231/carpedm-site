import Link from 'next/link';

const PROFILE_PHOTO_DATA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wgARCAKtAbgDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAIDAQQFBgcI/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAEDAgQF/9oADAMBAAIQAxAAAAH6oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxwDvc741wj6v47yUJfo3ufgV6fovY/Pfar7a8/3iQAAAAAAAAAAAAAAAAAAAABE0/iP0/5Icpnbl1MbVRVizBVmys630f5FafpiXkfXWAAAAAAAAAAAAAAAAAAAAOB3/jp5PTx1paGzF1o3+j9Rnr47d+iR56+YcH6/wCdPmee/wATXz/QfrPwn7l1zYAAAAAAAAAAAAAAAAAAACj87for8/mhvUej573vRdnaw9Gvs2ZvNcLq109Lc1stuR4T6T5HXHyH6K/PH2bfy+qFAAAAAAAAAAAAAAAAAAAPjP2bwB809v4b3XOnuZV62G3QUbHXOGYmvzdHjzvpaezzuOvI+8890fR5vrLmdPrMKAAAAAAAAAAAAAAAAAAeX9RpHwH6Z80+uZbR0e5Rnrq9Dh9RelVdoxXW1F5eh6DE65nh/pvzrrP0n1z5N9Z04DXzgAAAAAAAAAAAAAAAAAKL+bz18s9puc/Hfc0u9HjTh9XdlpxrRtlx153vea7HOm7rdDR7z4vz32nkz0H1XwPvtvOHeYAAAAAAAAAAAAAAAAADX2MRxOd06PN7Lr9PYsu12mu7PS1Tm87p3Z6djUo2bz5Hkdjr98eu6B6PIFAAAAAAAAAAAAAAAAAAAVc3ruO/N3SjjvrWbOZ1q0WVNef5/wBPo867HX0daY+e9h4n6ht5+iN/OAAAAAAAAAAAAAAAAAAAABq8X0nEy1xOizLa7GM9TGtmqXS830OFxpP7B8g+v+jyhpkAAAAAAAAAAAAAAAAAAAAA0d7Wl5TLz+mrU26p1zdbranPfntfp6hzPp3zjpbYfUkZbecAAAAAAAAAAAAAAAAAAAApoNiEZmtqdfm5a0VX157V6O7pzrjZ3s89cWroT7595s8CXp8XdVWgAAAAAAAAAAAAAAAAwZxTQXUsk0sGLK5FmMUHMdLi4+iyuzHPerDd1ObyfTcj1/U5mlmz0eSHTjqHdnybjoNbYMgAAAAAAAAAAAAGmW0SEZIkozik5wmsab8mrZdMjVZI8zsdvUz359c7+O53aGprhV1J7HXHMs2c1Ru13xTmVVdG/k5jqgAAAAAAAAAAECiEZiWMmIzEWMkpwkYnXIzlElGWCUq5HKr7Pm+erOlmXXOYzhUY21Ebqplmnu883NDbrTd3fN+klAAAAAAAAAAae3zycsZJYDMq7SmWYkpYyRxnBZhkITMZhM1tDemRzGYxKJmm+olq7ejZvaezRLr9PmdOvG/QPm/uo3gAAAAAAAAAU60oks4kDBHY19gjXZEmxkiZMZxkhZAMTqJ1XUVnMsQjOsspupJ6m3rVmOKSUtYeb9R57qHrhAAAAAAAAAqNKyqwllkYzghsa95mMsDIYzjJFnAhOBOqdZZXKFWmYxVfSSp2Kaat9CNDe4xua1la4psyntFN0oAAAAAAADS3ecJRmZlHJljJXbTcSzGQMkcsiMoiEokDKRjHYtxPKFNtZbCyo05KLK/O9nzJ17+b11k2cpv9Lh9yUAAAAAAABy9/QLJRkZzjIzEQtrrNqUMmc4kM4yI5wYjKBDEsFW1q7JLIRpuoNiqdZXyupz7Od53p8hex2Ob3C1PCanpPL+olAAAAAAAA1dWyBOWMmQMYwZ17aTdljJnOJBgDJiuyoxEIbFVxmUZVXrbWmbMGuV15oTicX0PnZ16XtcLvWXYnhOV6Xz3Rl6gAAAAAABg5NmteW5hksQyI4wKLtQ62YyM5xkxkBkjVbWVThaRnCwhdCZjS3dSq4sJHkbnGLvOek8vOvRei8v6RNyOJVztvV2TuCAAAAAAEZUnJvptJZjIlhEixgru5vWNsyYZDGQyGKrKSu+m1IyiW7IY19iqtCGdZK+N0uAvU811eVOuz63znpUvrnizUlOg9CIAAAAAAae5zDXtrmSzjBPGJFcM1Gn3eZ2SKQwzEkwJMZI15Fec4MxzithhGYTgc2nZ1rKfOek8wuzyehp89+h73E7l4txOs19Xd5terEAAAAAAOH2uAbE6rCWGCTGCOh0OPXT6/nvQQZAGQIygRxkQjOAjKBs4wLY5wamh1OdZqed7fJXreb9X5idd7ucDuJsxnhNbQ6XHr1dmhvwAAAAABXwe/wDZnVYSjnBgGOR1+VU/Q83pxNGQBlgZhKACRqsqXMqbC6ym0zhEho72hZy+bvaq38jq8uXr97gd02oyilXK6unW12OJ24AAAAAAee9DwCdtVgxOJHGcDXttN22MgzEkxkAYYGGCMM4SqymS7NlUicMYM6e7q15qq7UNy3X3jmei876SNtka+vt86tnued9FAAAAAADg97hErozJAhCyJRdRfW/nEoMZMAzjAMZMRlSSiyV17GvW1HGYkYLNfYprxut1eRG50+X0a1fT8TvxZjOCGju6tanpfKeli4AAAAADl9TnlM65k2IGawjXZya9PKEoyBGQilkhnODFaouhXkxq7CpbGltEqpVybNOxp26nm/SedJ7tWyZ7vB70WYlgro2Ka5nT06E9OJQAAAAGnuUnOnzfPTr2et5O3jT0V3kq5fY8Dbr1w9Nbr3EpRyZYwZjnJDFsSicxXFrVPHL1zc6HK6Bs61vMO9x/Jxl7svJdA3+jz90u7vnOfL6fjas89udRpbab/ALG/f1wAAAAAAA8jxfpHmc9dK3Xu401+f1NDnr09tmt6PLr7nltxO/nwXAr7Jn43Kvq/nPnFZ7vb8f6yXb1vnyz6Hb82H0/U+d88+r8j5vjm/UPK+YnZ0fSeO646WluTr6lfubN55ni/oPh8d+jqbnI574P0b5r9f74uGuAAAAAAADn9BHhNmEsPTZpb+udLVqq1x393Q6HXGcxkU8rt5PGc36GrwtntuSfL32Gs+Pw+wV18k5/2ngR8vj9L1Jfn+x7608H3ff7KeX6+/Bdf2ng/SnU8R7TxOeu/x+zys9eJ9d+W/UtcA0zAAAAAAAA8/wAv1Pk8dtmueZ1z7dbRs73Y836LXGecEznAMRJV2YIgxCdZFkR5HY5S9bFlSYhbAxr3apZG+lbPjH3fgHzre6Xi+NPoH1T84/dO8+0LAAAAAAAAHjPZ+c470LtPY4116N+Pl00+jz5ac9Tb4EdufRz4vS0xzbVdeYsBFgYZISxknyuvzjYhCZbG6o19a3Jm3T6hGepI53zP6V88z25v3b5n9k1xyAAAAAAAABVaPDvR+M8/p6lNWp83fYxXb75mjV007ddU7Nnr+X3+npnC7e3jYRrOcEzjMC7Q3edGd7XnUqeb2SnXskau/wAndVTLTTQ934z6KBQAAAAAAAAAGPE+3jj38k6O9ys/XuY1tiXV9NRtbeWHQpxplRZtaqzsjhMo5JMCVcaV29G7nxvc/WuNzcnio4nUnH3qskuTv+fX1/rdXasAAAAAAAAAAAAo+c/S/Ocd+Q6VvT40ZzZrhmEaS7EdoVSrJI4J1Y1llhrRPm9DYK+rraJ2NfndCswsoSrW29A0bNPsy+/HUAAAAAAAAAAAA4/M7XCLZVzidWJlOwyJxrI4iJRjWYpqktnP2+DHWtu6JzumxWxColiqsr0ejxzl9/z/AKaX2w6gAAAAAAAAAAAHN4vc4hXbhFuKbDEmBVKoyxAxSoMWa10tHB2PTL08sXkjgsxVgshES4HZ5BxfbeE+jL6EWAAAAAAAAAAAAaPnPQ+Zi62qZbGIyzSRwzEardYjVilcWU88h7rz3fJYjiyWI4M5jkzXPVK9Xa0pfL/VflX16uiLAAAAAAAAAAAAORwuty4zKGaszBGaUhGdUR1NnQFMILbwevzF9vswqvN0YCeI5iSOKRzmIeY7/llp+ufLPqlbwsAAAAAA/8QAMBAAAQMCBAQGAwADAQEBAAAAAQACAwQRBRASIRMgIjEGIzAyQEEUM1AVJEI0FnD/2gAIAQEAAQUC/wD3DUAqjEaembU+KYAyTxJWOfTeKZ2GHFqeVMqo3kPaf5+JYvFh4xLGJaqUzuciV3V0yd8Z/wAtVB1DjkjJ6bFoZE1wcP5dWy8WLyPfNlZWKtnqsqLEJKWXDfEUJTXBzf5JcGrEcXihGIVIqJ+6ESdlZaVoK05MkLD4crhU0X8nFqptLT1VW+pexmo8Oycco4HSFmEyODcI6ZcPcxSRaURl4dqwZP5PifEDNUAbxtDU43Tad73Q4YSqTDmxoRhqdGCpIQ4VWHteKnD3NBZpWATCOuZfT/HndoirHulqGDdgVFh3RTUACbAAgyysiEVI1OpmqviDZYnGKamlE8H8eZnEixCPhVbBthVIKmXhCzRyFPRRWJwbvAXhqXi4T/I8T0xir4t1gY0NHLZPapXsYH1LLy6Zm1kJhk8Hym38jxdFemg74KbvJAAqY7snjetjk42GIzPkUVBO9NpDE18fCfiDOJD4WqIaU0mIQVh/j+JI+JhUeywaDh0s4fOZMN4hFBoTelC5UpsmMBNTidNSNfi/EijqPy5auntFGNEmDkx1H8eti49Jayov/HeylrYoF/n4HyR1AeWuVUdmF0kM+EwTwCkjhip6ThurR5D9p8HGup/jyyiJuLUPAnwzqop2P00dLwnx4NSwTNg3ClbdrHcORp1t0J+yq3eVVN8zw+3VXfx6yMSKSnEsOF9NN3WlAZnds7SJKKTU0qXtVvU+68MU238ecXZewjZw5GZmS2WoBV1VFBLDVH83i7TO2qDcshfUSUFKKOl/jkXDmaU7s0oFPeo/MfURukYyhbFHLg8TjHTNhWu6ezy6r3eHIQ6X+S9msOhKHcKYOIjHDa6rhYPz2lTTzyGUVIVBCI2VDvLqHLw7HppP5dSzhyDKwTqSJaeEnSFy/Dc90fSqqVT7nDoeBR/y6iPiRsNshlpCNgnKQ6VLNd0PXUfzZ49DwgUCiVrCc4KsqMqPet/m1Q6cibJ8jlc3le6zm7uWoxPwzE210f8AMk61ayIRC0Ixp8akC03U7NsDNp2m4/lF2UzMjldTmw0oRqeO6wV/+1G7f+Q6SyJJQzlZwzk4J7LotstKkWFUt62vLo1DiBsyVkg/h3snSrdy08vcTAwPyKLU/YWusLh4cFYNSpmp8ZiMUzgA8H+BdGVbuVrIIZFBXTpVp4jNLqZ2VlKNo4rmNoYyWpdxWPCuHD9ZaQVrc1Nmugb/ADHSLcrtmEM9RXU5CKyCliErOqJ+Tm3NND1VNSIQAXKNnTUMLWsDnMju0pvdx0lst/lOdqPoBW5Lp0bXqSm2CY3eSqeSIXSObBpY0WbUDy4/a4bhOFnVGw+opy13x5HX5Ty/fPVR6HSnhxQR7MbZrvb9TDy4t4z3R3FUfLZupBpjpJuNB8V7tIHKchmUOW+TraXONTK1tmo5P9kOwlCvdDtWfpp3XjrG+ThklpfiyuuczmUMyhz1T9EFJDoj5HdmdnC7Yimqo3goz5Eg1NimMFf8Q7LvysyKHOMwqkXA7faPYZBD29nRle6OlH+qw621n/sopOLTfDlNmjlj5BmeQIoFSbpqPdHsO30ExEdURUZ3pv1wP0003uwlxDfhym7+T6i7ZjmKCKK7ge/7+z2HZfbe7v2N2fCbVFObTB4jpYYzLJh8lqz4fc8saHqFN7Dv95BBHu33TG0p76rVXtrpepkx4QiaY5PhSmzBzM7j0ignpvtb2Qy+7JwX3Ue5/tc//aqTprr6CGa3VO6hdqh+DOdxzdnN9IoJ/aLs4JvbL7KduHbIbp5XEtVVMmqraziOJuJmeXh7tVN8GXeTmd3b6Rzj93/WZX0pAmOUp6yb1LeuqedLWs0sI1Nwx3wvvmemHp9Ts48jkPa7J3S+Z+9/NpReSNupx9re1GdFZ8CU2b98x7RHf1HL6yKkTfae5NlOFNujs6mb0xjpA6QF+us+BMUPQh9/o/eRQ9uRUvtZ7fsm6d1NnGk95Kb2t9o7Kr6VG8SM9eU9Y5TkVEfN9F3J/wA5FT+1h6C5RhB3XWBD3Uib2HYqrtw8NdqpPXvcjlOR7Qfs9Fybn9ONkOyqPZHvF9MK4o49Ruv+qQodh2KlILcKPlesew5Lq6LsnGzKX0ivvJva185/1wez7c7enHm1Pa+9Gd2klWKLbDT04ds71ne1vKc5z5dKyzLegUV95N7hHKcdEB2kdZSkNMb/APYqHK6otywXXZOX1Q7T+tKbRt5jlUv3pz5foHNvZyZ3RyfuyFO99Wy8cFwZXOItvQhMugLIjKn2q/WqT0t5zsC3iSxN0tV1dX9AJ3aPvm72gaXSe57dTGjhvl9jRvS7BgOZTXaKn1qk9Y5vubaOmHJbmPIezO/3k7s4KZE7VBtId2f9U3Zm67IohVGx9aR2qQczu9S6wpNx6B9AOuUVINqlXu2qb5jYWmFw8ykFg05FOVT7YzqZ6jtm+hVbjD329dy+mssUU7tVJu7JjqMR8p582nvaPIokKqkKoXaqX1JPY30KhU7U07emcxuMyqndseymbvTO2fbi010zN2yqFhl+B6j92BDnmGt8Edhb1DmzYZntVexxsnDqh3L26ZadMzcpO2GX9YjqHNdRs1PAt6hzahmFa6qRtObGTYwd6iEOVO43jVsiFIFQbTeq/wDYOZ/anHrnIdrq6acqjtUJ7rqLYzfqp+8ebgpXG2H3E/qv/aOWyk7UvruCbuh23K0oZTjpmNj9MO8g1w0sOosbYZFS2VL01fqzC0rRtyyhU3b0ycrZXDXNcne0e1pykVZCj2iT3aYqNNzKcLo7TRO1M9SpHmchV0dxA6z/AEiEVdakSSnhR5fTcpDZTjyy3UWN3m/VRpvI5PaSaZ1nepU+7MnK2T5tEjTcehdF6uhlddxEU5fX/Sk91W7THHump3VHR9m5lOTyAqV5fV+pUDbI2CdVQsP51OVxWrVs3qmj9vo2VsiFpWwTH2nc66Dttd5HODGOqmNR11Zk0wtuQIHahD0yNU+IU9OpcfiCk8RyhDxBLKmSzTqgo/x2+pMNUc1Qyna7FpZzw6qdCgYE+kYhPJTKGpZNFCQXsO3JZWVlbO4CdIE6dPmdcOc5UrCZjqJ7NbOyF1djXHe38gRsx8uLTI46LtouqXEH/gvFfPVCOhjanwMtVsAWE4U6rNPRx0/r4vhj6hU8XADcnKQbYfRwtpJKOGJsVZDKhKEaljEysgkOpa7KSthibL4npmoeI5KiSStqqZf5iPT/AJhri+vumyNKY+EOkxKkifHjtExVniCNx/8ApIWwVWKuqjxBfBat0VRisQhrsBEk1a/DbqkoW0qxGFs1HRtsPqUqscsGj4eHfAxSPTI3IhSBYa7VSYw/TSU1EFJhscqn8POcn4TW05GIV1Mn43XyCR8s50BYYzXW+ITppw423tcq7lqKm3fm1dzh29dil5a3D45KWSnmbURKcXhpxZfUzlP1SQs4cXwK6Li07EEQpGrBX+XjL/Pp+2bqeJylwWllT/DrVJgFSxYZh1RT1viS738GZaHhbre9ipfdkBctZYticsMpZGyxYcXSmBoFBOaaUbqT9cSd2n7U7eNX/Cmj4M7cpBthT9FXi5/3ac7Z75XKuVdOiElbpajCwr8eFcCFcGJVmCRVDm+G4HNmwKOJwwFpTMHY134cbRpZbuj20aoqKp1xzG0MU0QWpjxU7DBW68V+Fice7cnbqJ3Cqsa2q6V1wOc7oNtyFbo9oyq1/nAbWsjcojdSbMo23hpDokxZ1Q/DxqdIyWRiGLOK8NzMOIfCqo+JA1DKcb11WamSjkuGnblG6PKc9O0rf9v7JQCkTd1UnpodopRoqgVUYRSufXYSQJWOYQTG3Bp3VGG/ClZw5W5TMuhTxvbHEISKnSm1TSmyNeGG7UTdDtztVkBesvvbe6kGwOkPbqVE66qm3AKuqvpFZ1Tyu1HBoTBhvwsSj0vBQKKf0Rt9184KgsPFa5NHojK1p73ee7RYPQ6jNszDva/cA7alWu8o0tRUvwrAp6isG3w5YxKx7DDJrTOo1DiDfa61gI1DUJGlEps0jC2pNg4OGR5pjpMO6AspZeG0bxt2EvUzDf1vcnIu2rpC5mH0wpaT4uIU3GiYS4yv4bAUDlO+wpKV9VIymf8AkywSxJsljLUjThrnubzfaqN3RbNc+y1GonOwuiOmifpRKd2c6ww6L8qv+MRcVtPNSqMklrSuyunM1mniEMdKyznoUsUh/GhjTcr8t91JvLqsKmawootDH7rTZFHy6jundp36W+H4bRfHIDhiFD+I+5XEKFrU0QCedSHvmNyOlrnXIV+UvQO+pGTzXTkqGnL3dgjlMwX4otKdpbyyUsAp4PkTQtnjqaZ1NMBZU9KMto03pDdy+RMGV1fNxy1IyIapHQ09k1lkS1qNSwLilyJJUjbgWap5S84NFxMQ+S42FcxlSY6azukLdyaxrE910XXQjTRZOPIUSj2cdgwEN2XEbGn1hemQySpsLGIvAW7lIDpIAE0i8ON8/wCTXtLkGhqFitNl1omy0OcWtDciUTkcnFNTlO9NfsGzOTaJzkynYxWWkKwV0/qU1gJfZ4a93yaz29y0q2Q5CVdagi8IyJzimpxU03m0zHaRxF1qz1Zy6l1KxVlVvsajVw/DTbM+TXfrARTXcllsnZlOKKClk0toInVVS1paNRWsLUxdKsEWrQFYBSWMtZIXHw6zTSfJrf1oFFiBIV1dXROZKL0S45fVY/UqGn4MVytS1BdBWli0tWhaFIdLdKqD14ELYf8AJrP0uOQK7rsr5F63yK3Kdsr3MrtDKFpqKkCwzsFbMlP3T+lj3XODN04f8mu/S3qPK8oDNzgFqcUbBNNziElmYVFpi5yjdWVWbRGyw4Wovk4k60LNhyErvkU5PyOyaVOeNU0zdEKurrUtS1LUi7IlV013FthQf+P5OKdhyE8hRUrrK5KIV7No266kdt1crUVq5qh2lkY4slTsqH/x+r//xAAmEQACAgEDBAICAwAAAAAAAAAAAQIRAyExQBASMEEgIlFgBBNw/9oACAEDAQE/Af3pIWMUUPH+BxrjxVi0Q2JiRmjx47/C5Cb9k40xquLjGRViWpOyKfslufyKtcSCt0ztp6HdpQnWxZNaWRdktzK7fETpm6vpFGgmbGV1rxozaE7L0IqBcaKtmd8fG/XVHcZd+Ot+iNCjJHkQl6EIsmvrfJhK+iM8tK5SyfkuiTvl92n+WrmRHy4j5aHy4j5aH+vxi5bH9S9jxfjzxg5CxxJxS8OOXoYh7/Gy/lXTD7ImbwromZF9vNi2ZEy7+KD06ZV78yNYjd+LG9ekNdB41Y8Q4teRyuHkh9hR7V0bUdyMosyQQ+NDI4Hd3a9Ms76XyITonl9L9hfLQ/B//8QAJhEAAgIBAwQCAgMAAAAAAAAAAAECEUADECESIDAxQVEEYBMycP/aAAgBAgEBPwH96Y5jkxagneO3Q+ShjNKWPL1tW1IaXwRlaxtQTJOhvghRJr4IejSxJOkN2uSqdj5KI+xoiQ9Yj2Q3sy2aaxnGxqmVs2WaWPNfO7Okhjvssg8icfkoZRB81kyVbM0o83lOBQlWXX+WvMeYxZbzH++OSR/J9C1PvzuVDmyMm/DNCGLuortvbUGafhezRF8dl7WX3zJEPXil72h9eZnDKrxTQj8p9MeDRnLoVimJ35FGpeSbUfZLq19RNetlyOLIMWNqaMdT+x01ELLIPSIZATIONoXCj/kqiiFdEL8ihlisvgND98jwi6iGlRf1KVulG69py1ZXncdep3r98z1AlbDvzdu475ngD1L3vC//EACsQAQACAgICAAYDAAMBAQEAAAEAESExQVFhcRBAgZGhsTBQwdHh8CDxcP/aAAgBAQABPxD/APt7PzRNRx0dUHdagqtigND7CaqKU0fSML2EADGRN84SPuvDBvy8wFlJJHLyYjyKHAP643Ae2ICuhrGG1lxNRqArnX0i1Y6U7joCieYH8kV4uyKANayfmHldNlhQYieO2T8q3G+CBbab31g/MC6jI7/rHL3qMw5uXcSoSjkxxLHsx6gSm7WKCl6g1jjFobjVqqiB5fMQOH4iggiQrDxmp+IkuCCHyPWbhYnPWB0n9U1CDllacdoDwL/eokpaWNcHiFW28+JboT7f/sLIewagNgL7xFUt5vXMv2fSG3iPUVl9kWmGEMWFjC4zUVTZW2J43/VNWCyngCN9bsuD0ELAWXvo7gAuE62ysM5Vuw8f/ksKrO3EXcAAG88R5VioyePeIXItqKy9nH1jleX2khaniY1BnBzxMr1Mizd4h0hQtm07MJD+oWi9SrAzre9+mpRWrlFLOqceX8RhraIbtLBUqf51Gy6EZ4MBy3nRB22bFAEgOCVKq5uoMJFNCJ/65gtoOCaN0cwFQcIbS9RtSYlpfsNmjpwhBdATt7/qBSFvUc4gJtt+cQh4lzYjek5YoIBTy4UqjagFcAe4kAsziE0GsanTMVwDK55hopeEy/MkaWxVlhsQG77iaK4OxGCvJ32f1GYkHVbp3MnFYqscQxOdV4l5P0VOpVkG4YEFbCAC5xOMkDxqMJD1KEvtOcAx1RTZuIsUNY9yu/RYHB9k/qGKqtKGFMMI4ucK8w+CWEwlygb8RI2MdwsVEHiEKLCU9oQA02eL36mBM4WxrY9MSIMeSK75L4uoGqzHDCJ9aPtD+oXeB0KY/UYTlHDGYUKcarjxv8RlsBfENgM2VWwPbTCi8qBdOX1LQBP9gBINSrISI7W77T0TYSTKN+vf6go6GCw8tNw7nQVqnjHB4lVWagGu4tfOmc9G3iIr3gw911/UOFUzxTT+4lXRYJW3FBwdTioBmqR++Y/DzGc705qHddwq0FKtzl88Q3ssZdxivZGKaaucJTtIOopBJopoLQdwkIBgF0F0/uZ6hYY48PmAIgIN4tnFkDDuyRdi5IZLP6fuoH3WPzBP8FYpHuMF0z1GRVnRAxBbEYVA4xtxA1nBp3UtMMjvMRCm1QPSTAO+ofmm/UcNR07enNbrxETRKFzavdq5vDLcciuRbS8xVf3VFe2VJlg+wl+tqCvMEvN6nrb+of0zKBqsA5jbtbhi5eGs6hLGwG/FkIE7DYQuqy7LePR+5YVlwt5FcW1cHQr3bL4R7Le4pZNZleGjkQQVkibsM7shAhRRAbF2YJUhRY+8XdPEAP8As+B/SsKbBxeLhobCJrFebiUg6PYz+Yg7xmAo0fWCM7gtllxQ+LnnofmLHrI9nTKW4uXDBv8AHuAarBxjW4M6UvTbCv1CH9Mxi1kHo2ILQgvQjT7Si9iMUqIWXMQdx025hFf1MOpIa0VigzuL4gixaKXvf3laKkXKxf1mKw0xHrVl+uXwFssLLFhW193+oLUhTC/3b9EwEMgOGYaZSDcydlRid2W8L1NOztZHfYrmbE0Rvmz3KQYpap4OiVcBjAH6yy6MY5lYvvJvZKGZVLGIEpNna+MflD+ppzgaYEEekjBlI0nmJgRguWLmsgeglMKXQfmJ1m1W1BrnquBm1lpGIIQe1xXMhpV4OCDw0FMMQtdrHqVBFqewD/X+rRsDKca6GnkiEMcES2QWES7jiZDfPtqI1oezVfaYuk20/cyoNq6y9kvjjCzxHAWncHI2uO5g4H3of3/WVsuEilW4g25gBTuK78okNAxaIBVAASxWKuYA3aZlSi8JuAAGAP6xBMywCvtkSqZQQ94jNUPrL2FdXMixQnNjrE5k3nMKkdv0h/W3kM5PTC/Qx6KQ239IY3X1uPKAXBLcoia9fMakIjwjrI2QJWlHrzIf1bAc3K+ss6tVLSyWYSpe0TG0eowJiGMNS0icylAUq/UZXTI+p5CP6pQ5g3HtmQ1EugYByRCYbPxDS+Y6uDQwUAqRMi5QoQDRzL+kXGCfL5lQAgnkd/1AC1CYQ/VL8ung0QQDNwLM6lwCuzl79RljIykuCrSgwdMYjSlYINAQ03WE02VmOOxAxG3o0l+yeodvJ/SVBBAqFu+I2Dp0QqzqNWCDq4UhUGHGTCM2ESh79PiPIgObJSTFzqrWpZtGXCtEu9La1MIzvsQUlo/ZLSWa9kZjXlSR0LebzAxC3hhn5/QhLgV7RzGrqZMFg6FeJbNyaCUShlQI+G9Lhisx8SySi+Q4HzBuZGVD3AKuJctrFHSqsE1ClGQ6ZcTnkNpiX2AZIJoUYXiYEMRlgOGHLny8QezHj5tQLdRGvycQKR6lBgsgvGobnkmqHFyyBUFCnSdJfGXcooFQWsGDa4SFkg4tJRV3dwwSUi2IoKD70TFwwceZYkqpii2GYi1AWLAmm24DVSYTuMQzsiQndeGJJtMPDBEsb+YBkoIsMDHuBWtQXULZzHm3EawjpThgpmUZFRGVQAcTcWOwhJZrqYPyiQFen1wdQlIwCpgywRF6NMsWu+VdxOso3UPDrEN8cjMO5GfEE5u5gnmdJsKxprMl2nEtMCxzh7v5d7SwjHQKzAuGqTCuY1Z8SiDKQbIoIEFS8iVMG4GGVXjhg9yjVID+DKlVC04I80WWsrCVEVRhMAw/GWXSjUz3a5/6IzCUliH6ho0U+YQlm7ftHyxc7o9wKORLXuErEqaiZv4aqQwzW6ZUm1zHHCK0GyGW4goWQNXZKthW3qcJOrqAgBiYcYkCi4TxUxV5mFyLhOOpcDCq2NhG3IzKBYrJfjQ3+UPlWHyPuGgQhqoMU3GXQySq/hBmeYIdNRmoafhqZQ3qOBU6h5jNoXKIxUC6mImcUBM7wwH5KihOVj1CEmsbvBK8UwS7GEMBR+eIRJYlj38oKmguXV2rmvgNzNShyESpcTBYIpnSJAcXCeSUNMcwNkmSYwUowAjVR1OLgZr4bsv4XqIu8hwhWpQ3cB4p/UFE22/oweoor7Qq7QDJwwrC7J5w+UwPa+yUoifAR03xH7DKxNJWWZEwmrTJFxL4mxGIMocSpGC1zUWr4lNXcqoOc0wXCtqaHEufZknk1TYpRxGOysOtxctbi2mQPBHYwFnnD/kPk8o4P5jriDbCamYeJReBbh+4IlxzaJmORKplwWTCMyiprxGn5QWEsygg2otIrZMFHi7I/dIXQblhMpO+lofeUJ5od5l6KCy9EC3wE87/AM+TJloLg9mVwFTLUMSrjpyi6OycpWWpjMS5uViDM2SrItQOWIh9K1MjWzG8rLArIKQ7ZoeZuts2KhiFXJOtKbiEwzvFqPpCWsK9LlO40FJqLSvnMABpLPkvMhSViPiECVUQgqLzCJLqahxHNIMS7hxcJpmLLiol01Fg9St425lSBudJggcemVNeeJr8KC7jEelOJS2zEtA6SsUzDLQ22P8AhHZbMIhMHf1mabu39PkrrWDKAogSxKRYksN6fADlKzHMdQwyuogkqmJNI0D6xcvCAwW8I9rXRCdRbEmF7g3BJiLg6Mar3zEMarMRaAGr9xwMZah0bNQVgLlXBEQDNVF/5MWz9/JdgMIMTSEGLL1FS3zHfEubYlUy+JvEq4CoxKmCQ8ItZjFvqJxRjVK9QkFRYDODYepiphMNkxiwtE44y2fAl7mkNRh39WQcNLVNvkIgvFAPDj/PkSdaC41ntLNIahqEuXiYrtXLWVlg5JgzDwhcDN/BmsNkd4Q4grB9Qm1OSFIfBafgFY9TF7YZsQVtbmGVJwhQG4sk8kqpxFlFXOJZ0CMkpdeUz8jaF0uDL4hNS51FUGyH0EuS2QcxRil/A1FjOEhpHc5ksCoaRN3AuHiO5pcwYAPmWlgzPEKnA3LwGC40rSlEzI2wlCeS7gKhQaiNxzcIl5upmKgN7x/sPkLBOrUNt+IhHiYQKU8xOiTmUZhuGJcHEVziBuOoXKDMDhBt4iiUCay/eSOz6hsPUdC2zK1GZzRmMYsOmES8xUZE1KgNjLL/AK9YBAYJ/Owq+gQcXDUCBCOorioPUIToYHZBxKtPgvwEhkmpbImxDzMXUWHibBxNksKmL4SGNdka2XUbZpcTMWdVFROENA5sYgyzYMKlRXGb4KWpcuaPqn/v+daLl4NqP5gAzBKiueErMzI8V1DbHUfMKqAXUHqGI5lQ+ATCWSiDhmV3M/SGy9XHoMHfcIvGbsAK4irvdQWAO0qS1AsvX7l2d0sJjU1UDgvKAyu+pQTxALYxH/ahIdBxQOrP+v53S9KO98sNRUQwgiNWoCTEsvTguIcxTD6wTXwr4VAhmUdSllwMohjcdGNJQYFEOFhMQb+BiX+iNzVWJVdQalBdevERDluJTqcC+3iKo+xEp3UAEu1YQ5VX/nXB4f6gujqLEtWIY5gVEBUA1mMRwmtIYc0q6mMTuC//AAEWJowJdgv2+AwsFRbSVixnBCuutRO1lcRSC0yS9RWyWOzKsgbBtsgbw5g1ChGMPpZxUIEFxjWAL5r/ALfzkm6uh9YVz4TfwHQMLzkg6iE60NwQK1OEy7+HEKrMx8OIsR2TYyguWHgwFe516m01ZL35JUrhqC2LXmAJlwx606jLurqxKAJSNPtMMYPEcVz2lyrUrYAROiV/0v8Az+eknmfRLWsIIStUzWmKTURc1HZbUeoswXD8LFZjF+Bg+GS4TEvwOSoo1Ha+A43iNI4IbCdCIhALDOdKgUvG0x4UkICm5RcicwA0+IQCsyu11fcRUIwoS/Tj/f5xt8ZfbDQ85hlCuZTCJHcUygBZg0+AREUIUkbwwMZUcQHqEEYEVlQoEjuVm+ZdHmAPjmBfCVV4IXXuEx1QJS5tlJGFNwfLZauoWBqmHS3UARFRABdt6lDUHueTYHhjoey/5XUbcDQ9EyEQ8QoMxYDTcoebig8RrDTmAI5EhinwW+IR+GUBlBa7io2Tk73NGK8buXMNY3Kx4nW8zEy1zpHB7glbl5go20uZyj66WLNMuEozWoCCV5IIXVvcZYo9RV7QOElZxGYsuPp/L5XX8Q+1WExWolMkATU2qBCU2Muit1Fu4WKlwriofDiHw18ORRMjO41cSheJkYmGmbjUhwCM7scQ3aCcEckAQNJVlnOWAZe2GU2EK+g1gVAsBQW8xXdQDMYYFZcjTwajM2fuF/ldMf8Agm55li6lguAbCMW5gfgp7Jj2FiYgk5QQbP8A4JcXER3FvBCKmCUlOnEXL2QHEcOO5WFSEFqYcqGHXLEfUZn2o4EXSJW4p1eI/OZogR62g6MwhKWQ6E/lUbaH4jdhmDVruGGzHjcHDA+oPon0EURGdEIARN04g4h/8IMtYVzE8w5YM2Zj1TzLk7JYjsY7zG7i3DYpVLfJeIF53mUy7Je1iCzKInKUGWYmUxajqSX6ihTeW6p/lAEdOJnqgZ+YaCWrFQWyFSzhuYUzcsbI4CE9LzCANQmKz4B8VmO41FxLvMVL5lgocR2w3QeJSWBGWn2EYU4XCHwStDBU2gAblS8s01DfmZOoNYjhc6gywa2zeqqIrmq4iV1H2Nf7/Nh5iUVbAgY8QtVqdxAfEa4O4DX1BTDqNYRpkiuHwaZhmKsbqLVO48+ImwirSWKIylRYlnEMVw1IRCQgcx9oUMTDOstN5XMG0gJMDkMwKm8QqMRUe7WidVRbxCMWn2H81QndpZWOZeZgCqgEqOwkK91AnOYlkxeIMyjlibJVN/Bcxo6i2R+Bc1ARZzuWJIpthURdqxLArgiWS7gEgeIDNURlTbqLZ5jYmty1QXLcKKWPxh9znOSdYJYA+sNzRjbMZ8DMMCmAEqvZX6Q6ugRTKyphF1WPmJfOocsDxWIEWsJBMin/AF8kxy+IStDX4/UqxeGBQ3CFEQVdckAUcAD4hLVygX+IisnhqEA2VnERh68XLl7IsdwKLYOIqLTBFicMR+kNDMcZi+AohVBwT9QoJNZqKcikvjIcEd4rGU83qFSNYhkt4NwBJx3CoNhHkiMipKPEBnWkYcPcEsAAGg+TLQoenhhaIuThww9hHvWsy8QnSim1+pjpqrmMMX9YBa4mKOR1DbyTJw8MxtJdLzD1C56yttOopVwUu5npn0Kl0Uw8y6VzKswUvVlREyN4YpWVjUycB5hZFzI8QczUUF2mVXKDEUnM0j7gLpyZJlfTI5zCLtxZQu31gBoD5Rhf2wuTklHDVpOoIB2gw6PvHnzPE9ywK0nw4t1XDa8Q34Sxm0l+cdJuLNRcmLLOXMMrNPKqMNomJmKrcyLxHRzLxniK0lCrcuK0QPWEwD3Deqto1cPGwKibuZUU2RMICQ7IyXEqdwnzQQxHOHYpo+9Qx8tlIFEjTVdvauU8TPmreEXq8PEAQ4rc4ro5Ify0lGpRQQt/JCrhx/r8Q1Eo8xH286mAbyzCHAGgiGajfCQUZlFzLDUaZMH0JQ+hbEINA/eHa4qBuMB5ldzEevMKYybitXg6gVOMP1hjN5hbKmFLm1K1OYv1PzD5ZgGyqDCRMvZcN+0ctiffag5nPFzDumrGoHb6KOPEAZStYj7AccTEDBLHNwxTJYqV5g1m4HiLF3kgBppmdiGNxxAWrjWBacu2ErluxcQgzjqKQkCWpY7nBGK53HA2xzSxBTQCOVYXoCPLZfvfzIdi0+HhPMY0tfcOIlR4gTcUW+jyzCsPfEgzuXdUBrDGL2w3st06lyzIsN5mOi3aSl0kXkYHYMFBh3S0ShtaglqDE0panxlPIYCd4Ahl+0Zuy4i2uPMoDCKYGUIqzlh0I2TUKv0b54h8ymIO1qEKZDYNsMh7X9ypVnGCGlhwrc2Nc5ZYKHHxEqfc4IxtW9wMk2hUU7muQiM4EMN0eum+IzdxAuQDiAPACgMTwaikihsjh4MFGYI6XuB8w52lcEtEI9TC1MajfUCHyA3ATUBfth8yzRN2qt5iFavmfR+JdPabxRr1kox0F0QbUwofsmTtj1kdZallUxUbiu5VahCgj4XKrcWNQMhsaFsRQZ5xhC26WISLHbLsXHREsphMoFeYJSj6RvogJ+XGN1uzLusV/V+aIM7lZaTJxytZmJFJvEOMf1JfSxC6uie4jIExZjK22wHqbUOFBK9q8SqzuUZJ4g8WvURUR5oC5Pm4uKj4l/T6Stzf6QziJWbpMghOBcR6Nsyrjr3BCzYP3+aegzQrmMrRPUwCCSjYS1zaUVylZi/Uo3c3Q+mC1WTFkgZtAxEFI/Me6cQ5Ksdxbqb2mNxmsDUTMr6MzYP0S5iaGBnzCvAv3Kk/KAgWe7jsGCbnL0SxaHHiPs36D5o2vQgC+pjS75jnA6gAv7TmBZZCixqC2UxCtVheUVHrGbRIv9N38LgGadTBcH2lYIBVczBNnZF6EjrPsi8ARLc9Mv0/rGrH3oM5V7gCLKbpK2Mo4xP/AELPzQFPRjVZlzQjYbSnQuIu4I3EYdkssBMjYESzMh2B7RRpUvuTomOVdp7t4l2p9zRGIaOIu0QeO/cAd/ZjbogLqYMY1KGcoDpvCB4TbH3trFVKX7hfmrZusIiuUOYEfEG3zL2nIhCiYqJmXigsVGiMFYjQr0QvReXcaVI3CEWJdlsqvEEEU5xnlJgWWiXZ9o+2I7tj0h5pmZzG8GIrmELRCoCFbeWe9D5qjHJEFKZUGZZHjqXyMMdwUWwyhuLtdwAZdSlxuI2bYDIti71L5ijVyvomdxlfMANKihLWkWo+xHgtnhTx5fmKhdS5hMWt0luFVGattRjRtNxW3f6fmWJT0thDxEEqPEau4S4mptYeeZdMk4ocMphDzEwojxKLKYoFIYiVa8nllqLQEBQxvqAEJckt3BsbOpfiKysZzcFMoTJAKFMEDVXcoR/5P5v/2Q=';
const WORK = [
  {
    index: '01',
    ko: '스마트워크',
    en: 'SMART WORK',
    desc: '반복되는 업무와 협업 흐름을 정리하고, 기관이 실제로 계속 사용할 수 있는 업무환경을 만듭니다.',
    points: ['Google Workspace · Microsoft 365', '문서·회의·신청 흐름 개선', '기관 맞춤 업무환경 설계'],
  },
  {
    index: '02',
    ko: 'AI 활용',
    en: 'AI · VIBE CODING',
    desc: 'ChatGPT·Claude를 업무에 적용하고, 필요한 경우 AI로 작은 업무도구까지 직접 만드는 방법을 함께 다룹니다.',
    points: ['생성형 AI 실무 적용', '업무용 프롬프트·전용 도구', '바이브코딩 · 프로토타입'],
  },
  {
    index: '03',
    ko: '업무 자동화',
    en: 'AUTOMATION',
    desc: '한 번 입력한 데이터를 신청·집계에서 문서 생성과 발송까지 연결해 복사·붙여넣기 업무를 줄입니다.',
    points: ['Spreadsheet · Apps Script', 'DOCX · PDF 자동 생성', 'Email · 카카오 알림톡 발송'],
  },
  {
    index: '04',
    ko: '홍보·행사 운영',
    en: 'MEDIA · EVENT OPS',
    desc: '콘텐츠 제작부터 대규모 행사 신청·접수·인증·통계까지 현장에서 바로 돌아가는 방식으로 설계합니다.',
    points: ['영상 · 숏폼 · 카드뉴스', '신청 · 현장접수 · 인증', '행사 운영 시스템 구축'],
  },
];

const QUICK_CATEGORIES = [
  { index: '01', title: '만든 것', en: 'WORK', desc: '실제 현장에 투입한 시스템과 운영 사례', href: '#portfolio' },
  { index: '02', title: '바로 써보기', en: 'TOOLS', desc: '지금 바로 열어볼 수 있는 공개 도구', href: '#tools' },
  { index: '03', title: '의뢰 가능한 프로그램', en: 'PROGRAMS', desc: '강의 · 워크숍 · 컨설팅 · 구축', href: '#programs' },
  { index: '04', title: '현장 기록', en: 'FIELD LOG', desc: '최근 강의와 프로젝트 활동', href: '#fieldlog' },
  { index: '05', title: '실무 노트', en: 'FIELD NOTES', desc: '다시 찾아보는 AI·자동화·현장 운영 기록', href: '#notes' },
  { index: '06', title: '강사 소개', en: 'SPEAKER', desc: '프로필 · 최근 강의 · 현장 경험', href: '#speaker' },
];

const CATEGORIES = [
  {
    title: '행사 운영',
    line: '사전접수부터 현장 접수, 인증 이벤트, 스태프 운영, 경품 추첨까지. 행사 하나를 종이 없이 돌립니다.',
    meta: ['최대 1,500명 규모', '반복 사용 시스템 1종', 'DX · 스마트워크'],
    problem: '행사마다 구글 폼을 새로 만들고, 명단을 엑셀로 내려받아 현장에서 종이로 체크합니다. 접수 확인 문자는 수백 통을 손으로 보내고, 인증 이벤트는 종이에 받아 경품 지급이 밀립니다. 스태프 30명이 각자 다른 큐시트를 들고 있습니다.',
    solve: '행사 하나를 6자리 코드 하나로 열면 신청·명단·현장 접수·통계 화면이 자동으로 생깁니다. 신청 즉시 카카오 알림톡이 나가고, 현장 접수 화면은 몇 대를 켜도 실시간으로 맞춰집니다. 인증 이벤트는 QR로 참가자가 직접 제출하고, 스태프는 모두 같은 당일 안내 페이지를 봅니다.',
    tools: [
      { name: '행사 운영 시스템', desc: '코드 하나로 7개 화면 자동 생성, 실시간 동기화, 관리자 비밀번호 보호. 여러 행사에 반복 사용' },
      { name: '사전접수 + 알림톡 자동 발송', desc: '신청과 동시에 카카오 알림톡. 2026 등반대회 사전접수 1,470명(목표 1,200명 초과), 현장 1,500명' },
      { name: '완주·포토 인증 페이지', desc: '동시접속 100~200명 대응, 전화번호 기준 1회 제출' },
      { name: '스태프 운영 도구', desc: '준비물 3단 체크리스트(D-2 패킹·D-1 확인·당일), 당일 안내 페이지(타임라인·개인별 업무·큐시트·비상연락망, PIN으로 현장 수정)' },
      { name: '맞춤 신청 페이지', desc: '구글 폼이 못 하는 것들 — 5분 단위 시간 선점, 정원 도달 시 자동 마감, 회비 납부 등 자격 항목. 프로필 촬영 예약, 공동체 상영 GV(92석), 친선전 등' },
      { name: '경품 추첨기 · 수령 확인 앱', desc: '107명 참가 성과공유회에서 종이 뽑기와 서명지를 대체' },
      { name: '기념행사 통합 운영', desc: '사전등록·스태프 앱·포토 이벤트·SNS 인증까지 외주 없이. 협회 40주년 기념행사' },
    ],
    stack: ['Next.js', 'Supabase', 'Google Sheets API', 'Google Apps Script', 'Solapi 알림톡', 'Vercel'],
  },
  {
    title: '회의·소통 운영',
    line: '날짜 조율, 의견 수집, 위원회 운영. 단톡방에서 흩어지는 것들을 한 화면으로 모읍니다.',
    meta: ['공개 앱 2종', '위원회 상시 운영', '스마트워크 · AX'],
    problem: '회의 날짜 하나 잡으려고 단톡방에 "가능한 날 알려주세요"가 오가고 결국 아무도 정리하지 않습니다. 의견을 모으려면 유료 툴을 쓰거나 포스트잇을 붙이는데, 유료 툴은 기관 결재가 안 나옵니다. 위원회 활동 계획은 설문으로 받고 엑셀로 다시 정리합니다.',
    solve: '링크 하나를 뿌리면 각자 가능한 칸을 칠하고, 겹치는 시간이 바로 보입니다. 보드를 만들고 QR을 띄우면 참여자가 로그인 없이 카드를 붙입니다. 위원회 설문은 제출되는 순간 대시보드에 집계됩니다.',
    tools: [
      { name: '우모가 — 일정 조율 앱', desc: '여러 사람의 가능 시간을 한 화면에서. 벤토 그리드, 다크 모드, 홈 화면 설치(PWA)', url: 'https://schedule.carpedm.kr', urlLabel: 'schedule.carpedm.kr' },
      { name: '모담 — 의견·질문 보드', desc: '패들렛을 대신하는 우리 보드. 보드 무제한, 카드형 배치, 반응, 이미지 업로드, 링크 미리보기. 강의장에서 실시간 질문 수집에 사용', url: 'https://board.carpedm.kr', urlLabel: 'board.carpedm.kr' },
      { name: '위원회 의견수렴 설문 + 대시보드', desc: '정책·공정위원회 의견 수집과 활동계획 설문이 곧바로 집계 화면으로' },
      { name: '워크숍 웹 안내 페이지', desc: '일정·장소·숙소 배정·차량을 한 페이지에. 1박 2일 워크숍 17명 운영' },
    ],
    stack: ['React', 'Supabase', 'Firebase Hosting', 'Google Apps Script', 'Vercel'],
  },
  {
    title: '업무 효율화',
    line: '설치 없는 PDF 도구부터 스프레드시트→DOCX·PDF 생성→이메일·알림톡 발송까지. 반복 업무를 한 흐름으로 자동화합니다.',
    meta: ['공개 도구 pdf.carpedm.kr', '앱스 스크립트 자동화 다수', '스마트워크 · AX'],
    problem: 'PDF 하나 합치려고 유료 프로그램을 깔거나 민감한 문서를 외부 사이트에 올립니다. 신청은 구글 폼, 집계는 엑셀, 알림은 문자. 세 군데를 오가며 복사합니다. 회의록·공문은 매번 서식을 열어 같은 자리에 같은 것을 채웁니다.',
    solve: '파일이 서버로 가지 않는 브라우저 안 PDF 도구를 만들었습니다. Google Apps Script는 스프레드시트의 데이터를 읽어 DOCX·PDF 문서를 자동 생성하고, 결과를 이메일이나 카카오 알림톡으로 발송합니다. 기관 문서 규칙을 학습시킨 전용 AI 도구는 HWPX 회의록·기안·결과보고서까지 규격대로 만듭니다.',
    tools: [
      { name: 'pdf.carpedm.kr', desc: '병합·분할·회전·텍스트 추출·압축·PDF→PPTX·PDF→JPG·페이지 편집·쪽번호. 업로드 없이 브라우저에서 처리', url: 'https://pdf.carpedm.kr', urlLabel: 'pdf.carpedm.kr' },
      { name: '시트 기반 신청·집계 자동화', desc: 'Google Apps Script 백엔드 + 정적 프론트. 기관 담당자가 스프레드시트에서 바로 관리할 수 있어 인수인계가 쉽습니다' },
      { name: 'Google Apps Script 문서·발송 자동화', desc: '스프레드시트 데이터를 기준으로 DOCX·PDF를 자동 생성하고, 생성된 문서나 안내 내용을 이메일 또는 카카오 알림톡으로 자동 발송' },
      { name: '행정문서 자동 생성', desc: '협회 행정문서 규칙(날짜·항목기호·글꼴·"끝" 표시)을 학습시킨 AI 도구로 회의록·기안·결과보고서를 HWPX로 생성' },
      { name: '단축 URL', desc: 'carpedm.kr/ax 같은 짧은 주소. 강의장에서 QR 대신 말로 불러 줄 수 있는 길이' },
      { name: '비영리 라이선스 도입 지원', desc: 'Google Workspace·Microsoft 365·AI 라이선스 등 무료·할인 신청부터 정착까지. 예산 없이 시작하는 방법' },
    ],
    stack: ['Vanilla JS', 'Google Apps Script', 'Google Drive', 'Gmail', 'Solapi 알림톡', 'python-hwpx', 'Cloudflare Workers', 'Vercel'],
  },
  {
    title: 'OpenClaw AI 시스템',
    line: 'Mac mini를 상시 AI 허브로 만들고, 역할이 다른 AI 에이전트와 Obsidian 지식베이스를 하나의 업무 시스템으로 연결했습니다.',
    meta: ['4-Agent AI 운영체계', '평일 08:30 자동 브리핑', '로컬 AI · 멀티에이전트'],
    problem: 'ChatGPT·Claude·로컬 AI를 각각 사용하면 같은 맥락을 반복해서 설명해야 하고, 결과도 여러 서비스와 파일에 흩어집니다. 매일 쌓이는 회의·프로젝트·메모를 AI가 활용하려면 개인정보와 원본 파일을 무분별하게 수정하지 않으면서 지속적으로 읽을 수 있는 구조도 필요했습니다.',
    solve: 'Mac mini M4를 상시 AI 허브로 두고 OpenClaw가 역할별 에이전트를 연결하도록 구성했습니다. main이 작업을 조율하고 developer는 GPT-5.6 Sol, critic은 Claude Opus 5, local은 Ollama의 gemma4-agent를 사용합니다. Obsidian Vault를 공통 지식베이스로 연결하고 Docker 읽기 전용 샌드박스로 원본 보호 원칙을 유지합니다.',
    tools: [
      { name: 'OpenClaw 멀티에이전트', desc: 'main이 작업을 조율하고 developer·critic을 목적에 따라 호출. 개발과 검토를 하나의 흐름으로 연결' },
      { name: 'Obsidian 지식베이스', desc: '프로젝트·회의·Daily Note·inbox를 하나의 Vault에 축적. iCloud 동기화와 심볼릭 링크로 Mac mini와 개인 기기에서 같은 지식베이스 사용' },
      { name: '로컬 AI — Ollama', desc: 'gemma4-agent를 이용해 반복적인 읽기·요약 작업을 로컬에서 처리. 클라우드 모델 사용량을 줄이고 역할을 분리' },
      { name: 'CarpeDM 아침 브리핑', desc: '평일 오전 8시 30분 Daily Note·진행 프로젝트·최근 회의·inbox를 읽어 오늘의 체크리스트와 다음 행동을 자동 정리' },
      { name: 'Telegram 원격 인터페이스', desc: 'Mac mini에서 상시 동작하는 OpenClaw와 Telegram을 연결해 외부에서도 AI 시스템에 접근' },
      { name: '읽기 전용 AI 운영', desc: 'Docker sandbox와 read-only Vault를 기본값으로 두고 AI가 원본 문서를 임의로 수정하지 못하도록 권한을 제한' },
    ],
    stack: ['OpenClaw', 'Obsidian', 'Ollama', 'GPT-5.6 Sol', 'Claude Opus 5', 'Docker', 'Telegram'],
  },
  {
    title: '캠페인·홍보',
    line: '현장 인증 사진 수집, 서명운동, 기념 영상, 웹 초대장. 촬영 장비 없이 담당자 혼자 이어갈 수 있는 홍보.',
    meta: ['40주년 미디어 산출물 27건', '캠페인 대상 158개소 1,152명', '미디어 · DX'],
    problem: '캠페인 참여 사진을 카톡과 메일로 받으면 정리에 이틀이 걸리고 개인정보 동의를 받을 방법이 없습니다. 행사 영상은 외주를 주면 예산이 없고, 안 주면 아무것도 남지 않습니다.',
    solve: 'QR 하나로 사진 제출과 개인정보 동의를 같이 받고, 사진은 드라이브로, 데이터는 시트로 자동 분리 저장합니다. 영상·카드뉴스·웹 초대장은 무료 도구 조합으로 내부에서 만들고, 그 방법을 강의로 다시 전달합니다.',
    tools: [
      { name: '이슈온 — 현안대응 캠페인 플랫폼', desc: '판넬 문구 9종 슬라이드쇼, 사진 병렬 업로드 제출, 시의회 전달용 서명 페이지, 관리자 숨김 기능. 14개 직능·158개소·1,152명 처우개선 이슈' },
      { name: '40주년 기념행사 미디어', desc: '기념 영상, SNS 인증 앱, 포토 이벤트 등 27건' },
      { name: '《샌드위치 사회복지사 생존기술》 북콘서트', desc: '텀블벅 펀딩, 웹 초대장, 현장 아케이드 게임' },
      { name: '기관 홍보 영상·숏폼 제작법', desc: 'Canva AI·Vrew·CapCut·Suno·Google Earth Studio 조합. 대학생 봉사단 103슬라이드 강의로 정리' },
    ],
    stack: ['Next.js', 'Supabase', 'Google Drive API', 'Canva', 'Vrew', 'CapCut', 'Vercel'],
  },
];


const PROGRAMS = [
  {
    index: '01',
    type: '강의 · 실습 워크숍',
    title: '생성형 AI 실무 · 바이브코딩',
    desc: 'ChatGPT·Claude를 업무에 적용하는 데서 끝나지 않고, 반복 업무를 해결하는 작은 도구를 직접 만드는 흐름까지 다룹니다.',
    result: 'AI 활용 구조 · 업무용 도구 프로토타입',
    tags: ['ChatGPT', 'Claude', '바이브코딩'],
  },
  {
    index: '02',
    type: '실습 워크숍 · 구축',
    title: 'Google Apps Script 업무 자동화',
    desc: '스프레드시트 데이터를 기준으로 신청·집계부터 DOCX·PDF 생성, 이메일·카카오 알림톡 발송까지 한 흐름으로 연결합니다.',
    result: 'Spreadsheet → 문서 → 발송 자동화',
    tags: ['Apps Script', 'DOCX·PDF', 'Email·알림톡'],
  },
  {
    index: '03',
    type: '교육 · 컨설팅',
    title: '스마트워크 · 디지털 전환',
    desc: 'Google Workspace·Microsoft 365와 협업 도구를 기관의 실제 서식, 결재, 인수인계 흐름에 맞춰 적용합니다.',
    result: '업무진단 · 적용안 · 정착 구조',
    tags: ['Google Workspace', 'Microsoft 365', 'DX'],
  },
  {
    index: '04',
    type: '강의 · 콘텐츠 실습',
    title: '기관 홍보 콘텐츠 · 숏폼',
    desc: 'Canva·Vrew·CapCut·Suno 등 접근 가능한 도구를 조합해 담당자가 혼자서도 이어갈 수 있는 제작 방식을 익힙니다.',
    result: '영상·숏폼 제작 워크플로',
    tags: ['Canva', 'Vrew', 'CapCut'],
  },
  {
    index: '05',
    type: '컨설팅 · 시스템 구축',
    title: '행사 디지털 운영',
    desc: '사전신청, 알림, 현장 접수, 인증, 스태프 운영, 추첨, 통계를 하나의 행사 운영 시스템으로 설계합니다.',
    result: '행사별 운영 흐름 · 현장 도구',
    tags: ['접수', '알림톡', '현장 운영'],
  },
];

const LIVE_TOOLS = [
  {
    name: '우모가',
    en: 'SCHEDULE',
    url: 'https://schedule.carpedm.kr',
    host: 'schedule.carpedm.kr',
    desc: '여러 사람의 가능한 시간을 한 화면에서 겹쳐 보는 일정 조율 도구. 로그인 없이 링크 하나로 참여합니다.',
    action: '일정 조율 시작하기',
  },
  {
    name: '모담',
    en: 'BOARD',
    url: 'https://board.carpedm.kr',
    host: 'board.carpedm.kr',
    desc: '의견·질문을 카드로 모으는 참여 보드. 강의장 질문 수집과 회의 의견 정리에 바로 사용할 수 있습니다.',
    action: '보드 열기',
  },
  {
    name: 'PDF Tools',
    en: 'PDF',
    url: 'https://pdf.carpedm.kr',
    host: 'pdf.carpedm.kr',
    desc: '병합·분할·회전·압축·PPTX/JPG 변환 등을 브라우저 안에서 처리합니다. 파일을 별도 서버에 올리지 않습니다.',
    action: 'PDF 도구 사용하기',
  },
];

const FIELD_LOG = [
  { type: 'PROJECT', year: '2026', place: '2026 서울사회복지사 등반대회', title: '1,500명 행사 운영 시스템', detail: '사전접수 1,470명 · 현장 접수 · 인증 · 스태프 운영' },
  { type: 'LECTURE', year: '2026', place: '강원도사회복지사협회 보수교육', title: 'AI 도구 활용을 넘어 도구 생성', detail: 'Google Apps Script 업무 자동화' },
  { type: 'LECTURE', year: '2026', place: '고양시덕양행신 대학생 봉사단', title: 'AI로 만드는 기관 홍보 영상·숏폼', detail: '실습형 콘텐츠 제작 교육' },
  { type: 'LECTURE', year: '2026', place: '4·16재단', title: '스마트워크 · 생성형 AI 활용', detail: '현장 실무 중심 교육' },
  { type: 'LECTURE', year: '2026', place: '한국타이어나눔재단 후원 지역아동센터', title: '스마트워크 · 생성형 AI 활용', detail: '3회 교육' },
  { type: 'PROJECT', year: '2026', place: '서울특별시사회복지사협회 40주년', title: '기념행사 미디어·디지털 운영', detail: '기념 영상 · SNS 인증 · 포토 이벤트 등 27건' },
];


const FIELD_NOTES = [
  {
    no: '01',
    category: 'AI',
    title: '사회복지기관에서 AI를 도입할 때 먼저 정할 것',
    desc: '모델을 고르기 전에 어떤 업무를 맡기고, 어떤 자료까지 읽게 할지 역할과 권한부터 정리합니다.',
    tags: ['AI 운영', '권한 설계', '현장 적용'],
  },
  {
    no: '02',
    category: 'AUTOMATION',
    title: '한 번 입력한 데이터를 문서와 발송까지 연결하기',
    desc: 'Spreadsheet를 기준으로 Apps Script가 DOCX·PDF를 만들고 이메일·알림톡까지 보내는 자동화 흐름을 정리합니다.',
    tags: ['Apps Script', 'DOCX·PDF', '알림톡'],
  },
  {
    no: '03',
    category: 'FIELD OPS',
    title: '1,500명 행사를 종이 없이 운영할 때 필요한 것',
    desc: '사전접수, 현장 체크인, 인증, 스태프 화면, 통계를 하나의 흐름으로 묶을 때 놓치기 쉬운 지점을 기록합니다.',
    tags: ['행사 운영', '접수', '현장 시스템'],
  },
  {
    no: '04',
    category: 'SMART WORK',
    title: '좋은 자동화보다 인수인계가 쉬운 자동화',
    desc: '담당자가 바뀌어도 유지되는 구조를 만들기 위해 시트, 권한, 문서 규칙, 운영 화면을 어떻게 단순화하는지 다룹니다.',
    tags: ['스마트워크', '인수인계', '업무 설계'],
  },
];

const FAQS = [
  {
    q: '강의와 컨설팅·구축은 어떻게 다른가요?',
    a: '강의는 개념과 사례를 이해하고 실습하는 데 초점을 둡니다. 컨설팅은 기관의 실제 업무 흐름을 함께 진단하고 적용안을 설계하며, 구축은 필요한 웹도구·자동화·운영 화면을 실제로 만들어 적용하는 단계까지 포함합니다.',
  },
  {
    q: '비개발자도 AI·Apps Script 실습에 참여할 수 있나요?',
    a: '가능합니다. 코드를 외우는 방식보다 반복 업무를 작은 단계로 나누고 AI와 함께 만드는 방식으로 진행합니다. 참여자의 숙련도에 따라 예제와 실습 범위를 조정합니다.',
  },
  {
    q: '기관에서 쓰는 실제 서식이나 업무를 가지고 실습할 수 있나요?',
    a: '가능하지만 개인정보나 민감정보는 제거한 예시 자료를 권장합니다. 실제 적용이 필요한 경우 권한과 데이터 범위를 먼저 확인한 뒤 별도 컨설팅·구축 단계에서 다룹니다.',
  },
  {
    q: '온라인 교육이나 원격 컨설팅도 가능한가요?',
    a: '가능합니다. 다만 계정 설정, 현장 운영, 여러 사람이 동시에 사용하는 도구 구축처럼 환경 확인이 중요한 경우에는 오프라인 또는 혼합 방식이 더 적합할 수 있습니다.',
  },
  {
    q: '교육 후에도 만든 도구를 계속 사용할 수 있나요?',
    a: '가능한 한 담당자가 직접 관리할 수 있는 구조를 우선합니다. Google Sheets, Apps Script, 브라우저 기반 도구처럼 기관이 이해하고 인수인계하기 쉬운 방식을 선호합니다.',
  },
  {
    q: '비용은 어떻게 정해지나요?',
    a: '강의 시간, 참여 인원, 준비가 필요한 실습 수준, 컨설팅 범위, 실제 구축 여부에 따라 달라집니다. 문의 내용을 확인한 뒤 필요한 범위만 제안하는 방식으로 진행합니다.',
  },
];

const BIZ = [
  { period: '2024.06 ~ 현재', name: '열매똑똑 스마트워크 사업 총괄 실무', desc: '서울시 사회복지시설·단체 디지털 전환 지원. Google·Microsoft 협업, 기관별 진단→컨설팅→교육→업무환경 구축', scale: '3년 63개소 · 연간 교육 20회' },
  { period: '2015 ~ 2017', name: '서울시 사회복지기관 디지털 리터러시 사업 기획·운영', desc: 'Microsoft 후원 디지털 전환 지원 사업', scale: '서울시 내 사회복지기관' },
  { period: '상시', name: '비영리 라이선스 도입 지원', desc: 'Google Workspace·Microsoft 365·AI 라이선스 등 비영리 무료·할인 라이선스 신청부터 정착까지', scale: '기관별' },
];

const LECTURES = [
  { year: '2026', host: '휴먼임팩트 협동조합', topic: 'AI 숨은 고수를 만나다 : 한계를 넘은 사람들 — 실시간 온라인(Zoom)', count: '2회 (7월·11월)' },
  { year: '2026', host: '강원도사회복지사협회 보수교육', topic: 'AI 도구 활용을 넘어 도구 생성 — 구글 앱스 스크립트 자동화', count: '1회' },
  { year: '2026', host: '고양시덕양행신 대학생 봉사단', topic: 'AI로 만드는 기관 홍보 영상·숏폼 (실습)', count: '1회' },
  { year: '2026', host: '4·16재단', topic: '스마트워크 · 생성형 AI 활용', count: '1회' },
  { year: '2026', host: '한국타이어나눔재단 후원 지역아동센터', topic: '스마트워크 · 생성형 AI 활용', count: '3회' },
  { year: '2015 ~ 2017', host: '서울시 사회복지기관', topic: '디지털 리터러시', count: '다수' },
  { year: '2014 ~ 2015', host: 'Microsoft 주최 NGO-Cloud Day', topic: '세션 강의', count: '5회' },
  { year: '2015 ~ 현재', host: '사회복지관 · 지역아동센터 · 시설 실무자 및 중간관리자', topic: '스마트워크 · 생성형 AI 활용', count: '연 20회 내외' },
];

const TOPICS = [
  '사회복지 현장의 스마트워크, 무엇부터 바꿀까',
  '실무자를 위한 생성형 AI 활용법 (실습)',
  '기록·문서 업무를 줄이는 디지털 도구 활용',
  'AI로 만드는 기관 홍보 콘텐츠·숏폼 (실습)',
  '예산 없이 시작하는 비영리 라이선스 활용',
  '기관 업무환경 진단과 디지털 전환 컨설팅',
  'AI 도구 활용을 넘어 도구 생성 — 앱스 스크립트·바이브코딩',
];



const CASE_METRICS = {
  '행사 운영': [
    { value: '1,500명', label: '현장 운영 규모' },
    { value: '1,470명', label: '사전접수' },
    { value: '7', label: '코드로 여는 운영 화면' },
    { value: '100~200명', label: '동시접속 대응' },
  ],
  '회의·소통 운영': [
    { value: '2종', label: '공개 운영 앱' },
    { value: '0', label: '참여자 로그인' },
    { value: '17명', label: '워크숍 웹 운영' },
    { value: '실시간', label: '의견·일정 집계' },
  ],
  '업무 효율화': [
    { value: '0', label: 'PDF 서버 업로드' },
    { value: '9', label: '브라우저 PDF 기능' },
    { value: 'DOCX·PDF', label: '자동 문서 생성' },
    { value: 'Email·알림톡', label: '자동 발송 채널' },
  ],
  '캠페인·홍보': [
    { value: '27건', label: '40주년 미디어 산출물' },
    { value: '158개소', label: '캠페인 참여 기관' },
    { value: '1,152명', label: '캠페인 참여자' },
    { value: '103장', label: '홍보 실습 강의자료' },
  ],
};

function CaseMetrics({ items }) {
  return (
    <div className="pv-metrics">
      {items.map((m) => (
        <div className="pv-metric" key={m.label}>
          <strong>{m.value}</strong>
          <span>{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function EventOpsVisual() {
  return (
    <section className="pv-case" aria-label="행사 운영 시각화">
      <div className="pv-case-head">
        <div>
          <span className="pv-eyebrow">CASE STUDY · EVENT OPS</span>
          <h4>1,500명 행사도<br />종이 없이 한 흐름으로 운영합니다.</h4>
          <p>신청부터 알림, 현장 접수, 인증, 경품, 통계까지 끊어진 도구를 하나의 운영 흐름으로 묶었습니다.</p>
        </div>
        <CaseMetrics items={CASE_METRICS['행사 운영']} />
      </div>

      <div className="pv-section">
        <span className="pv-section-label">OPERATION FLOW</span>
        <div className="pv-process">
          {['사전신청', '알림톡', '현장접수', '인증·추첨', '통계'].map((step, i) => (
            <div className="pv-process-step" key={step}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <strong>{step}</strong>
              {i < 4 && <span aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="pv-proof-grid">
        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Registration</span></div>
          <div className="pv-screen">
            <div className="pv-big">1,470 <small>/ 목표 1,200</small></div>
            <div className="pv-progress"><span style={{ width: '100%' }} /></div>
            <div className="pv-row"><span>현장 규모</span><b>1,500명</b></div>
            <div className="pv-row"><span>접수 즉시</span><b>알림톡 발송</b></div>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Event Code</span></div>
          <div className="pv-screen">
            <div className="pv-code">6자리 코드</div>
            <div className="pv-chip-grid">
              {['신청', '명단', '접수', '통계', '인증', '스태프', '관리'].map((x) => <span key={x}>{x}</span>)}
            </div>
            <p className="pv-caption">코드 하나로 필요한 화면을 반복 생성</p>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Live Operation</span></div>
          <div className="pv-screen">
            <div className="pv-row"><span>동시접속</span><b>100~200명</b></div>
            <div className="pv-row"><span>D-2</span><b>패킹</b></div>
            <div className="pv-row"><span>D-1</span><b>확인</b></div>
            <div className="pv-row"><span>당일</span><b>큐시트 · 비상연락</b></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MeetingVisual() {
  return (
    <section className="pv-case" aria-label="회의 소통 운영 시각화">
      <div className="pv-case-head">
        <div>
          <span className="pv-eyebrow">CASE STUDY · COLLABORATION</span>
          <h4>단톡방에서 흩어지던 결정을<br />한 화면으로 모읍니다.</h4>
          <p>로그인 없이 링크 하나로 참여하고, 일정과 의견이 들어오는 순간 겹치는 시간과 쟁점이 바로 보이도록 만들었습니다.</p>
        </div>
        <CaseMetrics items={CASE_METRICS['회의·소통 운영']} />
      </div>

      <div className="pv-section">
        <span className="pv-section-label">DECISION FLOW</span>
        <div className="pv-process four">
          {['링크 공유', '일정·의견 입력', '실시간 집계', '결정·운영'].map((step, i) => (
            <div className="pv-process-step" key={step}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <strong>{step}</strong>
              {i < 3 && <span aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="pv-proof-grid">
        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>우모가 · 일정 조율</span></div>
          <div className="pv-screen">
            <div className="pv-calendar">
              {[0,1,2,3,4,5,6,7,8,9,10,11].map((n) => <i key={n} className={n === 2 || n === 5 || n === 6 || n === 9 ? 'on' : ''} />)}
            </div>
            <p className="pv-caption">여러 사람의 가능한 시간이 겹칠수록 진하게 표시</p>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>모담 · 의견 보드</span></div>
          <div className="pv-screen pv-board">
            <div><b>질문</b><span>현장에서 가장 불편한 업무는?</span></div>
            <div><b>아이디어</b><span>접수와 명단을 한 화면으로</span></div>
            <div><b>의견</b><span>로그인 없이 바로 참여</span></div>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Workshop Guide</span></div>
          <div className="pv-screen">
            <div className="pv-row"><span>참여</span><b>17명</b></div>
            <div className="pv-row"><span>한 페이지</span><b>일정 · 장소</b></div>
            <div className="pv-row"><span>운영 정보</span><b>숙소 · 차량</b></div>
            <div className="pv-row"><span>업데이트</span><b>즉시 반영</b></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function EfficiencyVisual() {
  return (
    <section className="pv-case" aria-label="업무 효율화 시각화">
      <div className="pv-case-head">
        <div>
          <span className="pv-eyebrow">CASE STUDY · WORK AUTOMATION</span>
          <h4>한 번 입력한 데이터를<br />문서 생성과 발송까지 연결합니다.</h4>
          <p>민감한 PDF는 브라우저 안에서 처리하고, 스프레드시트의 데이터는 Apps Script가 읽어 DOCX·PDF로 만들고 이메일·알림톡까지 자동으로 이어 줍니다.</p>
        </div>
        <CaseMetrics items={CASE_METRICS['업무 효율화']} />
      </div>

      <div className="pv-section">
        <span className="pv-section-label">AUTOMATION PIPELINE</span>
        <div className="pv-process four">
          {[
            ['Spreadsheet', '신청·명단·운영 데이터'],
            ['Apps Script', '조건 확인 · 데이터 가공'],
            ['DOCX · PDF', '템플릿 기반 문서 생성'],
            ['Email · 알림톡', '대상자별 자동 발송'],
          ].map(([title, desc], i) => (
            <div className="pv-process-step pv-process-rich" key={title}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <strong>{title}</strong>
              <small>{desc}</small>
              {i < 3 && <span aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="pv-proof-grid">
        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>pdf.carpedm.kr</span></div>
          <div className="pv-screen">
            <div className="pv-tool-grid">
              {['병합','분할','회전','추출','압축','PPTX','JPG','편집','쪽번호'].map((x) => <span key={x}>{x}</span>)}
            </div>
            <p className="pv-caption">파일을 외부 서버에 올리지 않고 브라우저 안에서 처리합니다.</p>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Apps Script Automation</span></div>
          <div className="pv-screen">
            <div className="pv-automation">
              <div><span>TRIGGER</span><b>폼 제출 · 행 선택 · 일정</b></div>
              <div><span>CREATE</span><b>DOCX · PDF</b></div>
              <div><span>SEND</span><b>Email · 카카오 알림톡</b></div>
            </div>
            <p className="pv-caption">스프레드시트 한 곳에서 생성·저장·발송 흐름을 관리합니다.</p>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Document Rules</span></div>
          <div className="pv-screen">
            <div className="pv-rule">날짜·항목 기호 <b>✓</b></div>
            <div className="pv-rule">글꼴·정렬 <b>✓</b></div>
            <div className="pv-rule">HWPX 행정문서 <b>✓</b></div>
            <div className="pv-rule">문서 끝 표시 <b>✓</b></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function CampaignVisual() {
  return (
    <section className="pv-case" aria-label="캠페인 홍보 시각화">
      <div className="pv-case-head">
        <div>
          <span className="pv-eyebrow">CASE STUDY · CAMPAIGN & MEDIA</span>
          <h4>참여를 모으고, 기록으로 남기고,<br />다시 콘텐츠로 연결합니다.</h4>
          <p>QR 하나에서 사진 제출과 동의를 받고 데이터를 자동 분리합니다. 행사 기록은 영상·카드뉴스·웹 콘텐츠로 다시 활용합니다.</p>
        </div>
        <CaseMetrics items={CASE_METRICS['캠페인·홍보']} />
      </div>

      <div className="pv-section">
        <span className="pv-section-label">CAMPAIGN FLOW</span>
        <div className="pv-process">
          {['QR 참여', '사진·동의', 'Drive·Sheet', '서명·캠페인', '콘텐츠'].map((step, i) => (
            <div className="pv-process-step" key={step}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <strong>{step}</strong>
              {i < 4 && <span aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="pv-proof-grid">
        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>이슈온</span></div>
          <div className="pv-screen">
            <div className="pv-poster-stack">
              <span>공정처우</span><span>처우개선</span><span>현장 목소리</span>
            </div>
            <div className="pv-row"><span>판넬 문구</span><b>9종</b></div>
            <div className="pv-row"><span>참여 기관</span><b>158개소</b></div>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>40th Anniversary Media</span></div>
          <div className="pv-screen">
            <div className="pv-media-grid">
              <span>VIDEO</span><span>SNS</span><span>PHOTO</span><span>WEB</span>
            </div>
            <div className="pv-big">27건 <small>미디어 산출물</small></div>
          </div>
        </article>

        <article className="pv-proof">
          <div className="pv-window-bar"><i /><i /><i /><span>Content Lab</span></div>
          <div className="pv-screen">
            <div className="pv-row"><span>북콘서트</span><b>웹 초대장 · 게임</b></div>
            <div className="pv-row"><span>영상 제작</span><b>Canva · Vrew</b></div>
            <div className="pv-row"><span>숏폼</span><b>CapCut · Suno</b></div>
            <div className="pv-row"><span>강의자료</span><b>103장</b></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function PortfolioVisual({ title }) {
  if (title === '행사 운영') return <EventOpsVisual />;
  if (title === '회의·소통 운영') return <MeetingVisual />;
  if (title === '업무 효율화') return <EfficiencyVisual />;
  if (title === '캠페인·홍보') return <CampaignVisual />;
  if (title === 'OpenClaw AI 시스템') return <OpenClawVisual />;
  return null;
}

const OPENCLAW_METRICS = [
  { value: '4', label: '역할 기반 에이전트' },
  { value: '08:30', label: '평일 자동 브리핑' },
  { value: '1 Vault', label: '공통 지식베이스' },
  { value: 'Read-only', label: '기본 권한 원칙' },
];

function OpenClawVisual() {
  return (
    <section className="oc-case" aria-label="OpenClaw AI 시스템 시각화">
      <div className="oc-case-head">
        <div>
          <span className="oc-eyebrow">CASE STUDY · PERSONAL AI OPS</span>
          <h4>AI를 하나 더 쓰는 게 아니라,<br />AI가 일하는 구조를 만들었습니다.</h4>
          <p>
            요청은 한 곳으로 받고, 역할에 따라 모델을 나누고, 같은 Obsidian 지식베이스를 읽게 합니다.
            반복 업무는 로컬 모델과 자동화로 넘기고 원본은 읽기 전용을 기본값으로 둡니다.
          </p>
        </div>
        <div className="oc-metrics">
          {OPENCLAW_METRICS.map((m) => (
            <div className="oc-metric" key={m.label}>
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="oc-architecture">
        <div className="oc-section-label">SYSTEM ARCHITECTURE</div>
        <div className="oc-flow">
          <div className="oc-node oc-entry">
            <span>REMOTE</span>
            <strong>Telegram</strong>
            <small>외부에서 요청</small>
          </div>
          <div className="oc-arrow" aria-hidden="true">→</div>
          <div className="oc-node oc-core">
            <span>ORCHESTRATOR</span>
            <strong>OpenClaw · main</strong>
            <small>요청 분류 · 작업 조율</small>
          </div>
          <div className="oc-arrow" aria-hidden="true">→</div>
          <div className="oc-agents">
            <div className="oc-agent">
              <span>BUILD</span>
              <strong>developer</strong>
              <small>GPT-5.6 Sol</small>
            </div>
            <div className="oc-agent">
              <span>REVIEW</span>
              <strong>critic</strong>
              <small>Claude Opus 5</small>
            </div>
            <div className="oc-agent">
              <span>LOCAL</span>
              <strong>local</strong>
              <small>Ollama · gemma4-agent</small>
            </div>
          </div>
        </div>
        <div className="oc-knowledge">
          <div>
            <span>KNOWLEDGE BASE</span>
            <strong>Obsidian Vault</strong>
          </div>
          <p>daily · projects · meetings · inbox</p>
          <b>iCloud sync</b>
        </div>
      </div>

      <div className="oc-proof-title">
        <div>
          <span className="oc-section-label">HOW IT RUNS</span>
          <h5>운영 구성을 화면처럼 보여주기</h5>
        </div>
        <p>실제 설정을 이해하기 쉽게 단순화한 시각화입니다.</p>
      </div>

      <div className="oc-proof-grid">
        <article className="oc-proof">
          <div className="oc-window-bar"><i /><i /><i /><span>Morning Briefing</span></div>
          <div className="oc-brief">
            <div className="oc-brief-time">08:30 <small>MON–FRI</small></div>
            <div className="oc-check">✓ 오늘의 Daily Note 확인</div>
            <div className="oc-check">✓ 진행 프로젝트 우선순위</div>
            <div className="oc-check">✓ 최근 회의의 다음 행동</div>
            <div className="oc-check muted">○ 필요 시 inbox 확인</div>
          </div>
        </article>

        <article className="oc-proof">
          <div className="oc-window-bar"><i /><i /><i /><span>Obsidian / CarpeDM</span></div>
          <div className="oc-vault">
            <div><b>▾</b> CarpeDM</div>
            <div className="depth">📁 daily</div>
            <div className="depth">📁 projects</div>
            <div className="depth">📁 meetings</div>
            <div className="depth">📁 inbox</div>
            <div className="depth dim">📁 _templates</div>
          </div>
        </article>

        <article className="oc-proof">
          <div className="oc-window-bar"><i /><i /><i /><span>Sandbox Policy</span></div>
          <div className="oc-policy">
            <div><span>Vault</span><b>read-only</b></div>
            <div><span>Sandbox</span><b>Docker</b></div>
            <div><span>Local tools</span><b>read · ls · view</b></div>
            <div><span>원본 수정</span><b className="deny">기본 차단</b></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="brand">
          <b>CARPEDM</b>
          <span>FIELD-BUILT DIGITAL WORK</span>
        </Link>
        <div className="navmenu">
          <a href="#portfolio">만든 것</a>
          <a href="#tools">바로 써보기</a>
          <a href="#programs">의뢰 가능한 프로그램</a>
          <a href="#fieldlog">현장 기록</a>
          <a href="#notes">실무 노트</a>
          <a href="#speaker">강사 소개</a>
        </div>
        <a className="navlink" href="mailto:hello@carpedm.kr">
          <span>문의하기</span><b aria-hidden="true">↗</b>
        </a>
      </nav>

      <header className="hero">
        <div className="hero-main">
          <p className="kicker"><span>FIELD-BUILT</span> 사회복지 현장의 스마트워크 · AI 전환</p>
          <h1 className="lede"><span className="lede-line">현장의 문제를</span><span className="lede-line lede-line-strong"><em>작동하는 도구</em>로 바꿉니다.</span></h1>
          <p className="herosub">행사 운영, 업무 자동화, AI, 협업, 홍보까지. 설명으로 끝내지 않고 실제 현장에 넣어 반복해서 쓸 수 있는 시스템을 직접 설계하고 만듭니다.</p>
          <div className="hero-actions">
            <a className="hero-primary" href="#portfolio">대표 작업 보기 <b aria-hidden="true">↓</b></a>
            <a className="hero-secondary" href="#programs">강의·컨설팅 보기</a>
          </div>
        </div>
        <aside className="heroside">
          <div className="hero-side-label">PROOF POINTS · 2026</div>
          <div className="hero-side-grid">
            <div><strong>500+</strong><span>전국 방문 기관</span></div>
            <div><strong>63</strong><span>3년 동행 기관</span></div>
            <div><strong>20+</strong><span>연간 강의·컨설팅</span></div>
            <div><strong>1,500</strong><span>최대 행사 운영</span></div>
          </div>
          <div className="hero-short">
            <span>강의장에서 바로 부르는 짧은 주소</span>
            <b className="mono">carpedm.kr/ax</b>
          </div>
        </aside>
      </header>

      <section className="sec speaker-section" id="speaker">
        <div className="section-head speaker-section-head">
          <div>
            <span className="section-kicker">SPEAKER PROFILE</span>
            <h2 className="h2">현장을 알고, 직접 만들어 본 사람이 강의합니다.</h2>
          </div>
          <p>도구 기능을 나열하기보다 사회복지 현장에서 실제로 부딪힌 문제와 직접 만든 해결 방식을 중심으로 설명하고 실습합니다.</p>
        </div>

        <div className="speaker-grid">
          <article className="speaker-card speaker-card-main">
            <div className="speaker-id">
              <div
                className="speaker-photo"
                role="img"
                aria-label="고석우 강사 프로필 사진"
                style={{ backgroundImage: `url("${PROFILE_PHOTO_DATA}")` }}
              />
              <div>
                <span className="speaker-label">SOCIAL WORKER · DIGITAL PRACTITIONER</span>
                <h3>고석우</h3>
                <p>서울특별시사회복지사협회 과장 · 열매똑똑 스마트워크 사업 담당</p>
              </div>
            </div>

            <p className="speaker-intro">2010년 사회복지 현장에서 일을 시작해, 2014년부터 서울특별시사회복지사협회에서 근무하고 있습니다. 기관의 스마트워크·디지털 전환·생성형 AI 활용을 지원하면서 실제 업무에 필요한 웹도구와 자동화를 직접 만들고 운영해 왔습니다.</p>

            <div className="speaker-proof-grid">
              <div><strong>17년차</strong><span>사회복지 현장 경력</span></div>
              <div><strong>500+</strong><span>방문·컨설팅 기관</span></div>
              <div><strong>20회+</strong><span>연간 강의·컨설팅</span></div>
              <div><strong>63개소</strong><span>열매똑똑 3년 동행</span></div>
            </div>

            <div className="speaker-links">
              <a href="#programs">의뢰 가능한 프로그램 보기 <b aria-hidden="true">↘</b></a>
              <a href="#record">전체 강의·사업 이력 <b aria-hidden="true">↓</b></a>
            </div>

            <div className="speaker-materials">
              <div>
                <span>FOR ORGANIZERS</span>
                <strong>기관 담당자가 바로 활용할 수 있는 강사 자료를 준비하고 있습니다.</strong>
                <p>1페이지 강사 프로필 · 공문용 소개문 · 프로그램별 강의계획서 순으로 연결합니다.</p>
              </div>
              <span className="speaker-materials-status">PROFILE v5.1 READY</span>
            </div>
          </article>

          <aside className="speaker-card speaker-recent">
            <div className="speaker-recent-head">
              <span>RECENT LECTURES · 2026</span>
              <small>최근 강의 일부</small>
            </div>
            <div className="speaker-lecture-list">
              {LECTURES.slice(0, 5).map((lecture) => (
                <div className="speaker-lecture" key={`${lecture.host}-${lecture.topic}`}>
                  <div>
                    <strong>{lecture.host}</strong>
                    <p>{lecture.topic}</p>
                  </div>
                  <span>{lecture.count}</span>
                </div>
              ))}
            </div>
            <p className="speaker-note">강의 이력 전체는 아래의 <a href="#record">전체 이력</a>에서 확인할 수 있습니다.</p>
          </aside>
        </div>
      </section>

      <section className="sec service-overview" id="services">
        <div className="section-head service-head">
          <div>
            <span className="section-kicker">WHAT I CAN HELP WITH</span>
            <h2 className="h2">어떤 도움을 받을 수 있나요?</h2>
          </div>
          <p>강의로 끝낼 수도 있고, 실습 워크숍·컨설팅·시스템 구축까지 이어갈 수도 있습니다. 필요한 깊이에 맞춰 구성합니다.</p>
        </div>
        <div className="service-grid">
          {WORK.map((w) => (
            <article className="service-card" key={w.index}>
              <div className="service-card-top">
                <span className="service-index">{w.index}</span>
                <small>{w.en}</small>
              </div>
              <h3>{w.ko}</h3>
              <p>{w.desc}</p>
              <ul>
                {w.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <a href="#programs"><span>관련 프로그램 보기</span><b aria-hidden="true">↘</b></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sec category-section" aria-label="페이지 카테고리">
        <div className="section-head compact-head">
          <div>
            <span className="section-kicker">EXPLORE CARPEDM</span>
            <h2 className="h2">원하는 내용을 바로 찾아보세요.</h2>
          </div>
          <p>처음 방문해도 무엇을 볼 수 있는지 한눈에 알 수 있도록 주요 내용을 카드로 정리했습니다.</p>
        </div>
        <div className="category-card-grid">
          {QUICK_CATEGORIES.map((item) => (
            <a className="category-card" href={item.href} key={item.index}>
              <div className="category-card-meta">
                <span>{item.index}</span>
                <small>{item.en}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <b aria-hidden="true">↘</b>
            </a>
          ))}
        </div>
      </section>

      <section className="sec" id="portfolio">
        <div className="section-head portfolio-head">
          <div>
            <span className="section-kicker">SELECTED WORK</span>
            <h2 className="h2">실제로 만든 것부터 보여드립니다.</h2>
          </div>
          <p>기획안이 아니라 현장에 투입된 시스템과 도구입니다. 문제, 해결 방식, 운영 구조, 기술 스택까지 함께 보여드립니다.</p>
        </div>

        <div className="cat-list">
          {CATEGORIES.map((c, i) => (
            <details className="cat" key={c.title} open={i === 0}>
              <summary className="cat-sum">
                <div className="cat-index">0{i + 1}</div>
                <div className="cat-summary-copy">
                  <h3 className="cat-title">{c.title}</h3>
                  <p className="cat-line">{c.line}</p>
                  <div className="cat-meta">
                    {c.meta.map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
                <span className="cat-plus" aria-hidden="true" />
              </summary>

              <div className="cat-body">
                <div className="pair">
                  <div>
                    <h5>이런 문제를</h5>
                    <p>{c.problem}</p>
                  </div>
                  <div>
                    <h5>이렇게 풉니다</h5>
                    <p>{c.solve}</p>
                  </div>
                </div>

                <PortfolioVisual title={c.title} />

                <div className="tool-grid">
                  {c.tools.map((t) => (
                    <article className={`tool-card${t.url ? ' has-link' : ''}`} key={t.name}>
                      <div className="tool-card-copy">
                        <h5>{t.name}</h5>
                        <p>{t.desc}</p>
                      </div>
                      {t.url && (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tool-link"
                          aria-label={`${t.name} 새 창에서 열기`}
                        >
                          <span className="tool-link-copy">
                            <small>LIVE TOOL</small>
                            <strong>{t.urlLabel}</strong>
                          </span>
                          <span className="tool-link-action">바로 열기 <b aria-hidden="true">↗</b></span>
                        </a>
                      )}
                    </article>
                  ))}
                </div>

                <div className="stack">
                  {c.stack.map((tech) => <span className="tag" key={tech}>{tech}</span>)}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="sec tools-section" id="tools">
        <div className="section-head">
          <div>
            <span className="section-kicker">LIVE TOOLS</span>
            <h2 className="h2">설명보다, 직접 써보세요.</h2>
          </div>
          <p>강의와 현장에서 필요해서 만든 도구 중 공개 가능한 것들을 바로 사용할 수 있습니다.</p>
        </div>
        <div className="live-tools-grid">
          {LIVE_TOOLS.map((tool, i) => (
            <article className="live-tool-card" key={tool.name}>
              <div className="live-tool-top">
                <span className="live-tool-index">0{i + 1}</span>
                <span className="live-tool-status">LIVE</span>
              </div>
              <small>{tool.en}</small>
              <h3>{tool.name}</h3>
              <p>{tool.desc}</p>
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                <span><b>{tool.action}</b><small className="mono">{tool.host}</small></span>
                <i aria-hidden="true">↗</i>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="sec programs-section" id="programs">
        <div className="section-head">
          <div>
            <span className="section-kicker">PROGRAMS</span>
            <h2 className="h2">무엇을 의뢰할 수 있나요?</h2>
          </div>
          <p>단순한 도구 소개보다 실제 업무를 바꾸는 데 초점을 둡니다. 강의, 실습 워크숍, 컨설팅, 구축 형태로 조정할 수 있습니다.</p>
        </div>

        <div className="program-grid">
          {PROGRAMS.map((program) => (
            <article className="program-card" key={program.index}>
              <div className="program-card-head">
                <span>{program.index}</span>
                <small>{program.type}</small>
              </div>
              <h3>{program.title}</h3>
              <p>{program.desc}</p>
              <div className="program-result">
                <span>RESULT</span>
                <b>{program.result}</b>
              </div>
              <div className="program-tags">
                {program.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className="topic-bank">
          <span className="topic-bank-label">자주 다루는 주제</span>
          <div>
            {TOPICS.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
        </div>
      </section>

      <section className="sec fieldlog-section" id="fieldlog">
        <div className="section-head">
          <div>
            <span className="section-kicker">FIELD LOG</span>
            <h2 className="h2">최근 현장에서 한 일</h2>
          </div>
          <p>강의 횟수만 나열하지 않고, 어디에서 어떤 문제를 다뤘는지 최근 활동 중심으로 보여드립니다.</p>
        </div>
        <div className="fieldlog-grid">
          {FIELD_LOG.map((item, i) => (
            <article className="fieldlog-card" key={`${item.place}-${item.title}`}>
              <div className="fieldlog-meta">
                <span>{item.type}</span>
                <b>{item.year}</b>
              </div>
              <div className="fieldlog-no">{String(i + 1).padStart(2, '0')}</div>
              <p className="fieldlog-place">{item.place}</p>
              <h3>{item.title}</h3>
              <p className="fieldlog-detail">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec notes-section" id="notes">
        <div className="section-head">
          <div>
            <span className="section-kicker">FIELD NOTES</span>
            <h2 className="h2">다시 찾아보는 실무 노트</h2>
          </div>
          <p>강의에서 지나간 내용과 실제 구축 과정에서 배운 것을 AI·자동화·스마트워크·현장 운영 주제로 짧게 축적합니다.</p>
        </div>

        <div className="notes-intro">
          <div>
            <span>ARCHIVE PRINCIPLE</span>
            <h3>도구 이름보다<br />다시 쓸 수 있는 방법을 남깁니다.</h3>
          </div>
          <ul>
            <li><b>현장에서 시작</b><span>실제 반복 업무와 운영 문제에서 출발합니다.</span></li>
            <li><b>작게 검증</b><span>바로 써보고 수정할 수 있는 크기로 만듭니다.</span></li>
            <li><b>연결해 축적</b><span>개인의 요령을 조직이 다시 쓰는 구조로 남깁니다.</span></li>
          </ul>
        </div>

        <div className="notes-grid">
          {FIELD_NOTES.map((note) => (
            <article className="note-card" key={note.no}>
              <div className="note-card-meta">
                <span>{note.no}</span>
                <small>{note.category}</small>
              </div>
              <h3>{note.title}</h3>
              <p>{note.desc}</p>
              <div className="note-tags">
                {note.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>

        <p className="notes-roadmap">
          <b>다음 단계</b>
          노트가 쌓이면 주제·자료·영상·도구를 한 번에 찾을 수 있는 검색형 아카이브로 확장합니다.
        </p>
      </section>

      <section className="sec faq-section" id="faq">
        <div className="section-head">
          <div>
            <span className="section-kicker">FAQ</span>
            <h2 className="h2">의뢰 전에 자주 묻는 것</h2>
          </div>
          <p>문의폼을 만들기 전, 강의·컨설팅·구축 방식에서 자주 생기는 질문부터 정리했습니다.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <details className="faq-item" key={item.q}>
              <summary>
                <span className="faq-no">{String(i + 1).padStart(2, '0')}</span>
                <strong>{item.q}</strong>
                <b aria-hidden="true">+</b>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sec track-record" id="record">
        <div className="section-head">
          <div>
            <span className="section-kicker">TRACK RECORD</span>
            <h2 className="h2">숫자와 전체 이력</h2>
          </div>
          <p>최근 활동은 위에서 보여드리고, 전체 사업과 강의 이력은 필요할 때 펼쳐볼 수 있도록 정리했습니다.</p>
        </div>

        <dl className="stats">
          <div className="stat"><dt>강의·컨설팅</dt><dd>연 20회</dd></div>
          <div className="stat"><dt>열매똑똑 동행 기관</dt><dd>63개소</dd></div>
          <div className="stat"><dt>누적 방문 기관</dt><dd>500여 곳</dd></div>
        </dl>

        <details className="history-details">
          <summary>
            <span>
              <small>ARCHIVE</small>
              <strong>전체 사업·강의 이력 보기</strong>
            </span>
            <b aria-hidden="true">+</b>
          </summary>
          <div className="history-body">
            <h4 className="h3">사업 단위</h4>
            <div className="table-shell">
              <table className="rtable">
                <thead><tr><th>기간</th><th>사업</th><th>내용</th><th>규모</th></tr></thead>
                <tbody>
                  {BIZ.map((b) => (
                    <tr key={b.name}>
                      <td>{b.period}</td>
                      <td><b>{b.name}</b></td>
                      <td>{b.desc}</td>
                      <td>{b.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="h3">강의</h4>
            <div className="table-shell">
              <table className="rtable">
                <thead><tr><th>연도</th><th>주최·대상</th><th>주제</th><th>횟수</th></tr></thead>
                <tbody>
                  {LECTURES.map((l, i) => (
                    <tr key={i}>
                      <td>{l.year}</td>
                      <td>{l.host}</td>
                      <td>{l.topic}</td>
                      <td>{l.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </section>

      <section className="sec" id="about">
        <div className="section-head">
          <div>
            <span className="section-kicker">ABOUT</span>
            <h2 className="h2">현장을 알고, 직접 만듭니다.</h2>
          </div>
          <p>사회복지 현장을 이해하고, 그 안에서 실제로 사용할 디지털 도구와 운영 구조를 만드는 실무자입니다.</p>
        </div>
        <div className="about">
          <div>
            <p>사회복지 현장에서 일하며, 현장에 필요한 도구를 직접 만들어 왔습니다. 강의는 도구를 소개하는 자리가 아니라 참여자가 자기 업무에 맞는 도구를 하나 들고 나가는 자리여야 한다고 생각합니다.</p>
            <p>2010년 반포종합사회복지관에서 시작해 2014년부터 서울특별시사회복지사협회에서 근무하며, 지금까지 전국의 기관을 다니며 스마트워크와 디지털 전환을 함께 고민했습니다. 그 과정에서 만든 시스템들이 실제 기관에서 돌아가고 있습니다.</p>
            <p>강의·자문·시스템 구축 문의를 받습니다.</p>
          </div>
          <dl className="facts">
            <div className="fact"><dt>현장 경력</dt><dd>2010년부터</dd></div>
            <div className="fact"><dt>방문 기관</dt><dd>전국 500여 곳</dd></div>
            <div className="fact"><dt>동행 기관</dt><dd>63개소 (열매똑똑 3년)</dd></div>
            <div className="fact"><dt>연간 강의</dt><dd>20회 내외</dd></div>
            <div className="fact"><dt>저서 참여</dt><dd>샌드위치 사회복지사 생존기술</dd></div>
            <div className="fact"><dt>운영 영역</dt><dd>행사 · 회의 · 업무 · 홍보</dd></div>
          </dl>
        </div>
      </section>

      <section className="cta" id="contact">
        <div>
          <span className="cta-kicker">CONTACT</span>
          <h2>문의 폼은 다음 단계에서<br />필요한 항목에 맞춰 설계합니다.</h2>
          <p>지금은 이메일로 연락할 수 있도록 두고, 말씀해주실 항목을 기준으로 강의·컨설팅·구축 문의 흐름을 별도로 만들겠습니다.</p>
        </div>
        <a href="mailto:hello@carpedm.kr">
          <span>현재 문의 방법</span>
          <strong>hello@carpedm.kr</strong>
          <b aria-hidden="true">↗</b>
        </a>
      </section>

      <footer className="foot">
        <span>CARPEDM 카르페디엠</span>
        <span className="foot-map">만든 것 · 바로 써보기 · 의뢰 가능한 프로그램 · 현장 기록 · 실무 노트 · 강사 소개</span>
        <Link href="/admin" className="footlink mono">관리자</Link>
      </footer>
    </div>
  );
}
